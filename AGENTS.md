# Agent Guidelines

## TDD (Test-Driven Development) Requirement

All code changes, including bug fixes, new features, and minor adjustments, MUST follow the **t-wada style TDD** cycle:

1.  **Red**: Write a failing test case that reproduces the bug or defines the new feature.
    - Do not write implementation code before the test fails.
    - Ensure the test fails for the expected reason.
2.  **Green**: Write the minimum amount of code necessary to make the test pass.
    - Do not over-engineer.
    - Focus solely on passing the test.
3.  **Refactor**: Clean up the code while keeping the tests passing.
    - Remove duplication.
    - Improve readability.

**Strict Adherence**: This process is mandatory. Do not skip the "Red" phase even for "trivial" changes.

## Lint と型チェックについて

コードを修正したら、TDD に基づいてテストコードを流してエラーがないことを確認するのはもちろんのこと、Lint と Typecheck も流して全てのエラーと警告を常に例外なく 0 にすること
