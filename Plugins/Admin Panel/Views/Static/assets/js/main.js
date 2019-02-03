$(document).ready(function() {
  const sidebar = $('.sidebar');

  $('#sidebarBtn').click(function() {
    if(sidebar.width() == 0)
      sidebar.animate({width: '30vh'});
    else
      sidebar.animate({width: 0});
  });

  window.showLoading = function() {
    $('#loading').show();
  };
  window.hideLoading = function() {
    $('#loading').hide();
  };

  $('.selector#order .selection').click(function() {
    const values = ['asc', 'desc'];
    var value = $(this).data('value');

    if(value)
      value = value.toLowerCase();

    if(!value || !values.includes(value))
      return;
    if(value == dbManager.order)
      return;

    $('.selector#order .selection.active').removeClass('active');
    $(this).addClass('active');

    dbManager.order = value;
    dbManager.refresh();
  });

  $('.selector#limit .selection').click(function() {
    const values = [25, 50, 100];
    var value = $(this).data('value');

    if(value)
      value = Number(value);

    if(!value || !values.includes(value))
      return;
    if(value == dbManager.limit)
      return;

    $('.selector#limit .selection.active').removeClass('active');
    $(this).addClass('active');

    dbManager.limit = value;
    dbManager.refresh();
  });

  $('.selector#offset input').bind('keyup mouseup', function() {
    var value = $(this).val();

    if(value)
      value = Number(value);

    if((value !== 0 && !value) || isNaN(value))
      return;
    if(value == dbManager.offset)
      return;

    dbManager.offset = value;
    dbManager.refresh();
  });

  $('.search form').submit(function(e) {
    e.preventDefault();
    const user = $(this).find('input[type="text"]').val();

    if(!user) {
      if(dbManager.search)
        dbManager.fetchUserList(dbManager.filterUser);
    } else {
      if(dbManager.search != user)
        dbManager.fetchUser(user, dbManager.filterUser);
    }
  });
});