"""
EMNIST Model EXPORT ONLY Script for GleeGrow
=============================================
Use this AFTER training has completed but export failed (e.g., tensorflowjs error).
This script skips training entirely — loads the saved model and exports to TF.js.

Prerequisites:
  - You already ran train-emnist-model.py and training completed
  - The model file should exist in your Colab session

Usage (Google Colab):
  1. Run Cell 1 to install tensorflowjs
  2. RESTART RUNTIME (Runtime > Restart runtime)
  3. Run Cell 2 onwards — it finds your trained model and exports it
"""

# ============================================================================
# Cell 1: Install tensorflowjs
# AFTER RUNNING THIS CELL → Runtime > Restart runtime → then run Cell 2+
# ============================================================================

# !pip install tensorflowjs --quiet
# --- RESTART RUNTIME AFTER THIS CELL ---

# ============================================================================
# Cell 2: Find and load the trained model
# ============================================================================

import os
import glob
import tensorflow as tf
from tensorflow import keras
import numpy as np

print(f"TensorFlow version: {tf.__version__}")

# Search for saved model in common locations
SEARCH_PATHS = [
    'saved_model_emnist',           # SavedModel from train script
    'models/emnist_keras',          # Alternate save location
    '/content/saved_model_emnist',  # Colab absolute path
    '/content/models/emnist_keras',
]

# Also look for .h5 or .keras files
H5_PATTERNS = [
    '*.h5', '*.keras',
    '/content/*.h5', '/content/*.keras',
    '/content/**/*.h5', '/content/**/*.keras',
]

model = None

# Method 1: Try loading SavedModel format
for path in SEARCH_PATHS:
    if os.path.exists(path):
        print(f"Found SavedModel at: {path}")
        try:
            model = keras.models.load_model(path)
            print(f"Loaded successfully! Model has {model.count_params()} parameters")
            break
        except Exception as e:
            print(f"  Failed to load: {e}")

# Method 2: Try loading .h5 or .keras files
if model is None:
    for pattern in H5_PATTERNS:
        matches = glob.glob(pattern, recursive=True)
        for match in matches:
            print(f"Found model file: {match}")
            try:
                model = keras.models.load_model(match)
                print(f"Loaded successfully! Model has {model.count_params()} parameters")
                break
            except Exception as e:
                print(f"  Failed to load: {e}")
        if model is not None:
            break

# Method 3: Look for checkpoint files
if model is None:
    checkpoint_patterns = [
        'training_checkpoints/',
        '/content/training_checkpoints/',
        '/tmp/checkpoint*',
    ]
    for cp_path in checkpoint_patterns:
        if os.path.exists(cp_path):
            print(f"Found checkpoint directory: {cp_path}")

if model is None:
    print("\n" + "=" * 60)
    print("ERROR: No saved model found!")
    print("=" * 60)
    print("\nThe trained model was lost when the runtime crashed/restarted.")
    print("You have two options:\n")
    print("OPTION A: If training finished, save the model first.")
    print("  In your original notebook, run:")
    print("    model.save('saved_model_emnist')")
    print("  Then run this script again.\n")
    print("OPTION B: Retrain with auto-save (much faster with checkpoint resume).")
    print("  Use Cell 3 below to retrain — it saves checkpoints every epoch")
    print("  so you never lose progress again.\n")
    print("Listing all files in /content/ for debugging:")
    for root, dirs, files in os.walk('/content/', topdown=True):
        dirs[:] = [d for d in dirs if d not in ['.config', '.local', 'sample_data', '.cache']]
        level = root.replace('/content/', '').count(os.sep)
        indent = ' ' * 2 * level
        print(f'{indent}{os.path.basename(root)}/')
        subindent = ' ' * 2 * (level + 1)
        for file in files[:20]:  # Limit files shown
            size = os.path.getsize(os.path.join(root, file))
            print(f'{subindent}{file} ({size/1024:.1f} KB)')
        if len(files) > 20:
            print(f'{subindent}... and {len(files)-20} more files')
else:
    model.summary()

# ============================================================================
# Cell 3: ONLY IF Cell 2 FAILED — Quick retrain with checkpoints (~30 min)
# Skip this cell if Cell 2 loaded the model successfully!
# ============================================================================

if model is None:
    print("Starting retrain with checkpoint saving...")

    import tensorflow_datasets as tfds
    from tensorflow.keras import layers
    from tensorflow.keras.preprocessing.image import ImageDataGenerator

    # Load EMNIST
    ds_train, ds_test = tfds.load(
        'emnist/byclass', split=['train', 'test'],
        as_supervised=True, batch_size=-1
    )
    x_train, y_train = tfds.as_numpy(ds_train)
    x_test, y_test = tfds.as_numpy(ds_test)

    x_train = x_train.squeeze(-1)
    x_test = x_test.squeeze(-1)

    # CRITICAL: transpose EMNIST images
    x_train = np.transpose(x_train, (0, 2, 1))
    x_test = np.transpose(x_test, (0, 2, 1))

    x_train = x_train.reshape(-1, 28, 28, 1).astype('float32') / 255.0
    x_test = x_test.reshape(-1, 28, 28, 1).astype('float32') / 255.0

    NUM_CLASSES = 62
    y_train_cat = keras.utils.to_categorical(y_train, NUM_CLASSES)
    y_test_cat = keras.utils.to_categorical(y_test, NUM_CLASSES)

    print(f"Training: {x_train.shape[0]} samples, Test: {x_test.shape[0]} samples")

    # Data augmentation
    datagen = ImageDataGenerator(
        rotation_range=10, width_shift_range=0.1,
        height_shift_range=0.1, zoom_range=0.1, shear_range=5,
    )
    datagen.fit(x_train)

    # Build model
    model = keras.Sequential([
        layers.Conv2D(32, (3, 3), padding='same', input_shape=(28, 28, 1)),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), padding='same'),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), padding='same'),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.GlobalAveragePooling2D(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # Save checkpoint every epoch so we never lose progress
    CHECKPOINT_DIR = 'training_checkpoints'
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)

    callbacks = [
        keras.callbacks.ModelCheckpoint(
            filepath=os.path.join(CHECKPOINT_DIR, 'epoch_{epoch:02d}_acc_{val_accuracy:.4f}.keras'),
            save_best_only=True,
            monitor='val_accuracy',
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_accuracy', factor=0.5, patience=3, min_lr=1e-6, verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy', patience=5, restore_best_weights=True, verbose=1
        )
    ]

    BATCH_SIZE = 128
    EPOCHS = 20

    history = model.fit(
        datagen.flow(x_train, y_train_cat, batch_size=BATCH_SIZE),
        steps_per_epoch=len(x_train) // BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=(x_test, y_test_cat),
        callbacks=callbacks,
        verbose=1
    )

    # Save final model
    model.save('saved_model_emnist')
    print("Model saved to saved_model_emnist/")

    # Evaluate
    test_loss, test_accuracy = model.evaluate(x_test, y_test_cat, verbose=0)
    print(f"\nTest accuracy: {test_accuracy * 100:.2f}%")

# ============================================================================
# Cell 4: Export to TensorFlow.js (run this after model is loaded/trained)
# ============================================================================

if model is not None:
    OUTPUT_DIR = 'models/emnist'
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Save as SavedModel first (for CLI converter)
    SAVED_MODEL_DIR = 'saved_model_emnist'
    if not os.path.exists(SAVED_MODEL_DIR):
        model.save(SAVED_MODEL_DIR)

    # Try CLI converter first (avoids Python import conflicts)
    import subprocess
    result = subprocess.run(
        ['tensorflowjs_converter',
         '--input_format=tf_saved_model',
         '--output_format=tfjs_graph_model',
         SAVED_MODEL_DIR,
         OUTPUT_DIR],
        capture_output=True, text=True
    )

    if result.returncode == 0:
        print("Export via CLI converter succeeded!")
    else:
        print(f"CLI converter failed: {result.stderr[:200]}")
        print("Trying Python API fallback...")
        import tensorflowjs as tfjs
        # Clear output dir for clean export
        for f in os.listdir(OUTPUT_DIR):
            os.remove(os.path.join(OUTPUT_DIR, f))
        tfjs.converters.save_keras_model(model, OUTPUT_DIR)
        print("Export via Python API succeeded!")

    print(f"\nModel exported to {OUTPUT_DIR}/")
    print("Files generated:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
        print(f"  {f}: {size / 1024:.1f} KB")

    total_size = sum(os.path.getsize(os.path.join(OUTPUT_DIR, f)) for f in os.listdir(OUTPUT_DIR))
    print(f"\nTotal model size: {total_size / 1024:.1f} KB ({total_size / (1024*1024):.2f} MB)")
else:
    print("No model available for export. Run Cell 3 first.")

# ============================================================================
# Cell 5: Download
# ============================================================================

if os.path.exists('models/emnist') and os.listdir('models/emnist'):
    import shutil
    shutil.make_archive('emnist_model', 'zip', '.', 'models/emnist')

    try:
        from google.colab import files
        files.download('emnist_model.zip')
        print("\nDownload started! Extract to your GleeGrow project's models/emnist/ directory.")
    except ImportError:
        print("\nNot running in Colab. Model saved to: models/emnist/")
else:
    print("No model files to download. Export must succeed first.")
