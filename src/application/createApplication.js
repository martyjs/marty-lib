module.exports = function (MartyApplication) {
  return function createApplication(ctor) {
    class Application extends MartyApplication {
      constructor() {
        super();
        ctor.call(this);
      }
    }

    return Application;
  };
};