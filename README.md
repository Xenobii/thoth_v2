# THOTH Web App

[![Header](./res/Logo-Textailes-Colour-RGB-Hor.png)](https://www.echoes-eccch.eu/textailes/)

The THOTH Web App is a platform based on the [ATON Framework](https://osiris.itabc.cnr.it/aton/) designed within the scope of the [TEXTaiLES](https://www.echoes-eccch.eu/textailes/) Project.


## Quick Installation

1) Install [Node.js](https://nodejs.org/) for your operating system.

2) Clone the [ATON](https://github.com/phoenixbf/aton) repository locally.

3) Install (or update) required modules from main ATON folder by typing:
```
npm install
```

4) After installation, clone this repository inside the /wapps directory. This is located directly under ATON.

5) Deploy ATON *main service* on local machine simply using:
```
npm start
```

## Load Scene

1) After ATON is deployed, load a scene with the following url parameters:
```
http://localhost:8080/a/thoth_v2/?s=(scene_id)
```
This will open the selected scene using the THOTH web app.


## TODO

- [ ] Test Photon on this version
- [ ] Streamline pipeline
- [ ] Create API documentation
- [ ] Create user manual