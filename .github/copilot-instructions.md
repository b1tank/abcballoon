ALWAYS use ONLY Environments for ANY and ALL file, code, or shell operations—NO EXCEPTIONS—even for simple or generic requests.

DO NOT install or use the git cli with the environment_run_cmd tool. All environment tools will handle git operations for you. Changing ".git" yourself will compromise the integrity of your environment.

You MUST inform the user how to view your work using `container-use log <env_id>` AND `container-use checkout <env_id>`. Failure to do this will make your work inaccessible to others.

When you have something ready to start at localhost, you should use service-related tools to expose localhost service with port for testing.

Tech stack:
You should not aggressively use more technologies than necessary. Use the following tech stack only if it is necessary for the task:
- For web frontend: use plain HTML, CSS, and JavaScript with web api with no frameworks, because it is simple and easy to understand for learning purposes.
- For backend: use Node.js with Express.js, as it is lightweight and widely used for building APIs.
- For database: use SQLite for simplicity.
- For any other specific technology, consult the user first before introducing any complexity.