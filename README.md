# OperaBOT

> A simple API Server for unify multiples chats sources in one way. It use [WA_Server proyect](https://gitlab.com/jmdelafuente/_node_wa_server) and [FACE_Server proyect](https://gitlab.com/San-ti/_node_face_server) for messengers services. It's front-end agnostic and provides websockets for comunication with real operators (simple web frontend for testing but a Flutter or React app will be great). More documentation is needed.

## Supported Platforms

Following platforms are supported by OperaBot:

**macOS**
The minimum version supported is macOS 10.9.

**Windows**
Windows 7 and later are supported.

**Linux:**

- Ubuntu 12.04 and later
- Fedora 21 or later
- Debian 8 or later

## How to start the Server

### STEPS

Clone the repo, enter the folder and run

```bash
git clone https://github.com/jmdelafuente/_node_operabot.git
cd _node_operabot
npm install
node index.js
```

... it and you should be good to go.
*I haven't tested on Mac. Please be free of test and push new issue if needed*

## 💻 Technologies

- [Node](https://nodejs.org/en/)    -  Backend
- [Express](https://expressjs.com/) - Serverless / REST API
- [SocketIO](https://socket.io/)    - Comm with Frontend
- [SQLite](https://sqlite.org)      - DB

## FAQ

- **Is this app built with NodeJS?**

  Yes, it's built with [NodeJS](https://nodejs.org/en/) on backend and SocketIO for frontend communication. Please see the [Technologies](#technologies) section for more info.

- **What boilerplate did you use?**

  None. The idea was to get a better understanding of how things work together, But I do take a cue from other projects. Some Design Patterns are being used.

- **..but why? This doesn't exists already?**

  This solution is already provided by some companies but, I'm Argentinian and U$S and Euros are too expensive to pay for it. So, here is my free solution if you need it (as my employer needed it!).

## 📃 Legal

This is an independent software. Use at your own risk. **Commercial use of this code/repo is strictly prohibited.**. See LICENSE for detailed info.
