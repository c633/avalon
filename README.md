# Avalon
Another site for Avalon players

### I. Run on local
<pre>
$ meteor npm install
$ CLOUDINARY_KEY=<i>ApiKey</i> CLOUDINARY_SECRET=<i>ApiSecret</i> meteor --settings ./settings.json
</pre>

### II. Deploy to Microsoft Azure Web app for Linux users
#### 1. Prerequisite
- Update project to latest release `v1.4.1.1`

  ```
  $ meteor update
  ```
- Find the `node` version which will be used

  ```
  $ meteor node -v
  ```

  > v4.5.0
- Install proper `node` version by using `nvm`

  ```
  $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh | bash
  $ nvm install 4.5.0
  $ node -v; npm -v                     # Verify version
  ```

  > v4.5.0

  > 2.15.9

#### 2. Convert app into `nodejs` format and set configuration
- Install `demeteorizer`

  ```
  $ sudo npm install -g demeteorizer
  ```
- Convert to windows OS architecture

  ```
  $ demeteorizer -o ../Azure/avalon -a os.windows.x86_32
      # -o, --output <path>             Output folder for converted application
      # -a, --architecture <arch>       Build architecture to be generated
  ```
- Navigate to *demeteorized* app folder and install all the required `nodejs` modules

  ```
  $ cd ../Azure/avalon
  $ cd bundle/programs/server
  $ npm install
  ```

#### 3. Move app to Azure
##### On Azure Web app
- *General settings*
  - Enable __Web sockets__
- Add *App settings*
  - __WEBSITE_NODE_DEFAULT_VERSION__: `4.4.7`     (`node` version *4.5.0* is not available on Azure App service, find at *Advanced Tools (Kudu Services)* -> *Runtime versions*, Example: https://*site-name*.scm.azurewebsites.net/api/diagnostics/runtime)
  - __ROOT_URL__: *AppRootUrl*          (Example: http://*site-name*.azurewebsites.net/)
  - __MONGO_URL__: *MongoDbUrl*         (Example: mongodb://*user*:*password*@ds*xxxxxx*.mlab.com:*yyyyy*/*db-name*)

##### On local *demeteorized* project
- Create `web.config` file

  ```
  $ cd ../../                 # Back to 'bundle' folder from 'bundle/programs/server' folder
  $ touch web.config
  ```
  and insert this [link content][1] to that config file.
- Commit project to Web app git url

  <pre>
  $ git init
  $ git add -A
  $ git commit -m "Initial commit."
  $ git remote add azure <i>WebAppGitUrl</i>
      # Example: https://<i>user</i>@<i>site-name</i>.scm.azurewebsites.net:<i>xxx</i>/<i>site-name</i>.git
  $ git push azure master
  </pre>

#### 4. Store image using `cloudinary`
##### On Azure Web app
- Add extra *App settings* for `cloudinary` config
  - __CLOUDINARY_KEY__: *ApiKey*
  - __CLOUDINARY_SECRET__: *ApiSecret*
  - __METEOR_SETTINGS__: <pre>{"public":{"cloudinary":{"name":"<i>CloudName</i>"}}}</pre>

##### On local repository
- Add package `lepozepo:cloudinary`

  ```
  $ meteor add lepozepo:cloudinary
  ```
- *Demeteorize* then push to remote Azure repository

### III. Todos
- [x] Remove 'restart' button
- [x] Remove fixtures
- [x] Clear message text input after sending
- [x] Change route: `/groups/:id` -> `/groups/:name`, `/users/:id` -> `/users/:username`
- [x] Group name: format validation and unique
- [x] Lobby: add messages content
- [ ] Show result when approve/vote finished (Notification)
- [ ] Separate events
- [ ] `pub/sub` issue
- [x] Update `Meteor`

[1]: https://raw.githubusercontent.com/christopheranderson/azure-demeteorizer/master/resources/web.config
