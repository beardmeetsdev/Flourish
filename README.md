# Flourish

A simple single-page web app for a daily Flourishing assessment questionnaire.

## Run locally

Open `index.html` in a browser.

## Classification rule

This app uses the requested binary outcome:
- **Flourishing** when both thresholds are met:
  - At least one Emotional Well-being answer is `4` or `5`
  - At least six combined Social/Psychological answers are `4` or `5`
- **Languishing** otherwise
