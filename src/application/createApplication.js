module.exports = function (MartyApplication) {
  return function createApplication(ctor) {
    class Application extends MartyApplication {
      constructor(options) {
        super(options);
        ctor.call(this, options);
      }
    }

    return Application;
  };
};