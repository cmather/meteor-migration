Package.describe({
  summary: 'A simpler migration API'
});

Package.on_use(function (api) {
  api.use('underscore');
  api.use('reload');
  api.add_files('migration.js', 'client');
  api.export('onMigrate', 'client');
});
