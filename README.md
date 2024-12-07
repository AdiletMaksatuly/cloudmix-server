# Cloudmix - Backend for Chat Application
See frontend at: https://github.com/AdiletMaksatuly/cloudmix-client.git

## Prerequisites

Before you begin, ensure you have the following tools installed on your machine:

1. **Git**  
   [Download & Install Git](https://git-scm.com/).

2. **Node.js**  
   [Download & Install Node.js](https://nodejs.org/) (includes npm package manager).

3. **Docker**  
   [Download & Install Docker Desktop](https://docs.docker.com/desktop/).

---

## Clone This Repository

To download the project:

```bash
git clone https://github.com/AdiletMaksatuly/cloudmix-server.git
cd cloudmix-server
```

--- 

## Environment Variables
To run the application, you need to set up the environment variables. 

For convenience:
1. Find the .env.example file in the root of the project.
2. Rename it to .env.

Ensure the following:
- The port specified in APP_PORT is available.
- Frontend application is running at the URL specified in the FRONTEND_URL variable in the .env file.


---

## Run with Docker Compose
To start the application using Docker:

```bash
docker compose up
```
