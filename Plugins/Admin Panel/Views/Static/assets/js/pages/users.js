$(document).ready(function() {
  dbManager.setTarget('table.users tbody');
  dbManager.fetchUserList(dbManager.filterUser);
});