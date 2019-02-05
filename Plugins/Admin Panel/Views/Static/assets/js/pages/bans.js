$(document).ready(function() {
  dbManager.setType('ban');
  dbManager.setTarget('table.bans tbody');

  dbManager.fetchList(dbManager.filterBan);
});