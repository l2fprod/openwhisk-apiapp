$("#sayHelloForm").submit(function (event) {
  event.preventDefault();

  $(this).find("input:not(:disabled), button:not(:disabled)").prop("disabled", true);

  $.ajax({
    type: "POST",
    url: "/api/v1/greeting",
    contentType: 'application/json', //OpenWhisk wants this content-type
    data: JSON.stringify({ // and a JSON document as data
      name: $("#name").val()
    })
  }).done(function (data) {
    $("#greeting").text(data.response.result.payload);
    console.log(data);
  }).fail(function (err) {
    $("#greeting").text("Something went wrong, check the console");
    console.log(err);
  }).always(function (err) {
    $("#sayHelloForm").find("input, button").prop("disabled", null);
  });
});
