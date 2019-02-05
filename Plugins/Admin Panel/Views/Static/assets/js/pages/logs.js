$(document).ready(function() {
  dbManager.setType('log');
  dbManager.setTarget('table.logs tbody');

  dbManager.fetchList(dbManager.filterLog);
});