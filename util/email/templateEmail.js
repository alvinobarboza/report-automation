module.exports = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8"> <!-- utf-8 works for most cases -->
    <meta name="viewport" content="width=device-width"> 
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
    <meta name="x-apple-disable-message-reformatting">  

    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
</head>

<body>
	<p><b>Email enviado automáticamente</b></p>
	<p>Anexo relatórios gerados dia ${(new Date()).toLocaleString()}</>
	</br>
	<p>Qualquer dúvida/alteração informar ao Alvino: alvino.barboza@youcast.tv.br</p>
</body>
</html>
`