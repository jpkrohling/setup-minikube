# GitHub action for setting up `minikube`

This ia a simple GitHub Action for setting up the `minikube` binary for a GitHub Workflow.

## Usage

```yaml
jobs:
  your-job:
    steps:
    - uses: jpkrohling/setup-minikube@v1.0.0
```

or, overridding the version:

```yaml
jobs:
  your-job:
    steps:
    - uses: jpkrohling/setup-minikube@v1.0.0
      with:
        minikube-version: v1.3.1
```

## Contributing

This action is based on the JavaScript template. Check the [walkthrough](https://github.com/actions/toolkit/blob/master/docs/javascript-action.md) to get started with it. To contribute to this project, just open a PR with your proposed changes, making sure to include the transpiled files (`./lib/*.js`): you can get them as a result of `npm run build`.

## See also

- [setup-kubectl](https://github.com/jpkrohling/setup-kubectl)
- [setup-operator-sdk](https://github.com/jpkrohling/setup-operator-sdk)