$(document).ready(function() {
  function createOpts(body) {
    body = Object.keys(body).map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(body[key]);
    }).join('&');

    return {
      method : 'post',
      body   : body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
  }

  const form = $('#login');

  form.submit(e => {
    e.preventDefault();
    $('.notification').remove();

    const url = '/login';
    const btn = form.find('input[type="submit"]');

    const u_input = form.find('input[type="text"]');
    const p_input = form.find('input[type="password"]');

    const username = u_input.val();
    const password = p_input.val();

    const oldBtn = btn.val();

    u_input.removeClass('error');
    p_input.removeClass('error');

    if(!username || !password) {
      if(!username)
        u_input.addClass('error');
      if(!password)
        p_input.addClass('error');

      return;
    }

    const opts = createOpts({username, password});
    const fail = (err, display) => {
      if(err)
        console.error(err);
      if(!display)
        display = 'An error occured. Please try again later.';

      form.prepend('<div class="notification error">' + display + '</div>');
    };

    btn.attr('disabled', true);
    btn.val('');

    fetch(url, opts)
      .then(async res => {
        btn.val(oldBtn);
        btn.attr('disabled', false);

        if(res.status !== 200)
          return fail();

        const body = await res.text();

        switch(Number(body)) {
          case 0:
            form.prepend('<div class="notification success">Login successful. Redirecting...</div>');

            setTimeout(() => {window.location.replace('/')}, 3000);
          break;
          case 1:
            fail(null, 'Invalid account.');
          break;
          case 2:
            fail(null, 'Please fill the form.');
        }
      })
      .catch(fail.bind(this));
  });
});