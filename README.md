# Avalon
Another site for Avalon players

### Run on local
```
$ meteor npm install
$ meteor
```
### Deploy to Microsoft Azure Web app for Linux users
#### 1. Prerequisite
- Remove package `standard-minifier-js` due to build command fails while minifying app code

  ```
  $ meteor remove standard-minifier-js
  ```
- Update project to latest release *v1.4.0.1*

  ```
  $ meteor update
  ```
- Find the `node` version which is being used

  ```
  $ meteor node -v
  ```
  
  > v4.4.7
- Install proper `node` version by using `nvm`

  ```
  $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh | bash
  $ nvm install 4.4.7
  $ node -v; npm -v                   # Verify version
  ```
  
  > v4.4.7
  
  > 2.15.8
  
#### 2. Convert app into `nodejs` format and set configuration
- Install `demeteorizer`

  ```
  $ sudo npm install -g demeteorizer
  ```
- Convert to windows OS architecture

  ```
  $ demeteorizer -o ../Azure/avalon -a os.windows.x86_32
      # -o, --output <path>        Output folder for converted application
      # -a, --architecture <arch>  Build architecture to be generated
  ```
- Navigate to *demeteorized* app folder and install all the required `nodejs` modules

  ```
  $ cd ../Azure/avalon
  $ cd bundle/programs/server
  $ npm install
  ```

#### 3. Move app to Azure
##### On Azure Web app
- Add *App settings*
  - __WEBSITE_NODE_DEFAULT_VERSION__: *4.4.7*
  - __ROOT_URL__: *AppRootUrl*        (Example: http://*site-name*.azurewebsites.net/)
  - __MONGO_URL__: *MongoDbUrl*       (Example: mongodb://*user*:*password*@ds*xxxxxx*.mlab.com:*yyyyy*/*db-name*)

##### On local *demeteorized* project
- Create `web.config` file

  ```
  $ cd ../../                         # Change to bundle folder
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
  
[1]: https://raw.githubusercontent.com/christopheranderson/azure-demeteorizer/master/resources/web.config