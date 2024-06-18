# Build Documentation

This project uses GitLab CI/CD for building and deploying the application. The configuration for this process is defined in the [`.gitlab-ci.yml`](.gitlab-ci.yml) file.

## Build Process

1. The build process is initiated with the `dev_build` job defined in the `.gitlab-ci.yml` file.
2. The `npm install` command is run to install all the project dependencies.
3. The `npm run dev_build` command is run to build the project. This command is defined in the [`package.json`](package.json) file and it uses the `next build` command to build the Next.js application.
4. A zip file is created with the built project and it is securely copied to the server using the `scp` command.

## Deployment Process

1. The deployment process is initiated after the build process.
2. The old files in the `/home/ubuntu/milkyway/lucy` directory on the server are removed.
3. The new build zip file is copied to the `/home/ubuntu/milkyway/lucy` directory on the server.

Please refer to the [`.gitlab-ci.yml`](.gitlab-ci.yml) file for more details.