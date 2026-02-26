#!/bin/bash
# GleeGrow Platform - Complete Test Suite
# Run: bash tests/run-all-tests.sh
#
# Runs all unit and integration tests in sequence.
# Exit code 0 = all passed, non-zero = at least one failed.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TOTAL_PASS=0
TOTAL_FAIL=0
FAILED_SUITES=()

echo "========================================"
echo " GleeGrow Platform - Test Suite"
echo " $(date)"
echo "========================================"

run_test() {
    local name="$1"
    local file="$2"
    echo ""
    echo "----------------------------------------"
    echo " Running: $name"
    echo "----------------------------------------"

    if node "$file"; then
        echo "  => $name: ALL PASSED"
    else
        TOTAL_FAIL=$((TOTAL_FAIL + 1))
        FAILED_SUITES+=("$name")
        echo "  => $name: FAILED"
    fi
}

# Test 1: Math Engine Unit Tests
run_test "Math Engine" "$ROOT_DIR/functions/test-math-engine.js"

# Test 2: Client-Server Determinism
run_test "Client-Server Determinism" "$ROOT_DIR/functions/test-client-server-match.js"

# Test 3: Error Tracker (Adaptive Learning)
run_test "Error Tracker" "$ROOT_DIR/functions/test-error-tracker.js"

# Test 4: Adaptive Engine
run_test "Adaptive Engine" "$ROOT_DIR/functions/test-adaptive-engine.js"

# Test 5: Training Simulator (Synthetic Students + Validation Loop)
run_test "Training Simulator" "$ROOT_DIR/functions/test-training-simulator.js"

# Test 6: Level Mapper
run_test "Level Mapper" "$SCRIPT_DIR/test-level-mapper.js"

# Test 7: All Features
run_test "All Features" "$SCRIPT_DIR/test-all-features.js"

# Test 8: Navigation & Roles
run_test "Navigation & Roles" "$SCRIPT_DIR/test-navigation-roles.js"

echo ""
echo "========================================"
echo " FINAL RESULTS"
echo "========================================"

if [ ${#FAILED_SUITES[@]} -eq 0 ]; then
    echo " ALL TEST SUITES PASSED!"
    echo "========================================"
    exit 0
else
    echo " FAILED SUITES: ${#FAILED_SUITES[@]}"
    for suite in "${FAILED_SUITES[@]}"; do
        echo "   - $suite"
    done
    echo "========================================"
    exit 1
fi
