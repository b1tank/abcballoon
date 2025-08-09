ALWAYS use ONLY Environments for ANY and ALL file, code, or shell operations—NO EXCEPTIONS—even for simple or generic requests.

Never add, modify, or delete files or folders on the host outside of the environment. All operations must be done within the environment!!!!!

DO NOT install or use the git cli with the environment_run_cmd tool. All environment tools will handle git operations for you. Changing ".git" yourself will compromise the integrity of your environment.

You MUST inform the user how to view your work using `container-use log <env_id>` AND `container-use checkout <env_id>`. Failure to do this will make your work inaccessible to others.

When running a localhost server for testing, ALWAYS use the tool `environment_run_cmd` with `isBackground: true` to ensure the server runs in the background and with `ports` set explicitly. 

If you started the server before, just automatically restart the server every time after making changes to the code without asking the user.

Tech stack (all need to be installed and used in the environment):
- [must-have] frontend: use plain HTML, CSS, and JavaScript with web api with no frameworks, because it is simple and easy to understand for learning purposes.
- [must-have] backend: use Node.js with Express.js, as it is lightweight and widely used for building APIs.
- [only if necessary] For database: use SQLite for simplicity.
- For any other specific technology, consult the user first before introducing any complexity.