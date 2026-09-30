# Backend

Project backend structure and setup.

## Local admin setup

Set `ALLOW_PUBLIC_REGISTRATION=true` in the local `Backend/.env` file before starting the backend. Registration is disabled by default when this variable is unset, so keep it unset or set it to `false` in the hosted Render environment. The `create-admin.html` utility sends registration requests to `http://localhost:5000` and should only be used for local setup.
