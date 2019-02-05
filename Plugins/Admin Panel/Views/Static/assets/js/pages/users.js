$(document).ready(function() {
  dbManager.setType('user');
  dbManager.setTarget('table.users tbody');

  dbManager.fetchList(dbManager.filterUser);
});