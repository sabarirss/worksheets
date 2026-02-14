# How to Generate Story Images

## Overview
I've created detailed AI image prompts for all 100 stories. You'll need to use an external AI image generator to create the images.

## Step-by-Step Process

### 1. Choose an AI Image Generator
Pick any of these free/accessible options:
- **ChatGPT** (with DALL-E) - Best quality, requires ChatGPT Plus subscription
- **Bing Image Creator** - Free, powered by DALL-E
- **Leonardo.ai** - Free tier available
- **Midjourney** - Requires subscription, highest quality

### 2. Generate Images
1. Open the file `story-image-prompts.json` in this directory
2. For each story, copy the "prompt" text
3. Paste it into your chosen AI image generator
4. Generate the image
5. Download and save it with the exact filename specified (e.g., `animal_01.png`)
6. Place all images in the `images/stories/` folder

### 3. Update the Code
Once you have all images saved locally, I'll update the code to load from the local folder instead of using placeholder APIs.

## Example
For "The Helpful Rabbit" story:
- **Prompt**: "A cheerful cartoon rabbit helping a small injured bird, bringing leaves and berries, surrounded by colorful flowers in a sunny garden. Children's book illustration style, bright and friendly colors."
- **Filename**: `animal_01.png`
- **Location**: Save to `/home/sabari/kumon-claude/images/stories/animal_01.png`

## Batch Processing (Optional)
If you have access to an API key for any image generation service, I can help you create a script to automate this process.

## Quick Start with Bing Image Creator (FREE)
1. Go to https://www.bing.com/create
2. Sign in with Microsoft account (free)
3. Copy/paste each prompt
4. Download and rename images as specified
5. Place in `images/stories/` folder

You get 15-25 free image generations per day with Bing.
