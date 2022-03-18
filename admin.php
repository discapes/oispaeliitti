<head>
    <style type="text/css">
@import url(https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300,700|Open+Sans:400,300,600);
 * {
	 box-sizing: border-box;
}
 body {
    background: url(https://imgur.com/6IKHa4N.png) no-repeat center center fixed;
	 font-family: 'open sans', helvetica, arial, sans;
	 -webkit-background-size: cover;
	 -moz-background-size: cover;
	 -o-background-size: cover;
	 background-size: cover;
	 padding: 100px;
}

.file {
	width: 1200px;
}
 .log-form {
	 width: 40%;
	 min-width: 320px;
	 max-width: 475px;
	 background: rgba(0, 0, 0, 0.5);
	 position: absolute;
	 top: 50%;
	 left: 50%;
	 -webkit-transform: translate(-50%,-50%);
	 -moz-transform: translate(-50%,-50%);
	 -o-transform: translate(-50%,-50%);
	 -ms-transform: translate(-50%,-50%);
	 transform: translate(-50%,-50%);
	 box-shadow: 0px 2px 5px rgba(0,0,0,0.25);
}
 @media (max-width: 40em) {
	 .log-form {
		 width: 95%;
		 position: relative;
		 margin: 2.5% auto 0 auto;
		 left: 0%;
		 -webkit-transform: translate(0%,0%);
		 -moz-transform: translate(0%,0%);
		 -o-transform: translate(0%,0%);
		 -ms-transform: translate(0%,0%);
		 transform: translate(0%,0%);
	}
}
 .log-form form {
	 display: block;
	 width: 100%;
	 padding: 2em;
     padding-bottom: 1em;
}
 .log-form h2 {
	 width: 100%;
	 color: azure;
	 font-family: 'open sans condensed';
	 font-size: 1.35em;
	 display: block;
	 background-color: rgba(42, 42, 42, 0.5);
	 text-transform: uppercase;
	 padding: .75em 1em .75em 1.5em;
	 box-shadow: inset 0px 1px 1px rgba(255,255,255,0.05);
	 border: 1px solid #1d1d1d;
	 margin: 0;
	 font-weight: 200;
}
 .log-form input {
	 display: block;
	 margin: auto auto;
	 width: 100%;
	 margin-bottom: 2em;
	 padding: .5em 0;
	 border: none;
	 border-bottom: 1px solid #eaeaea;
	 padding-bottom: 1.25em;
	 color: #222;
     padding-left: 5px;
     background-color: rgba(255, 255, 255, 0.8);
}
 .log-form input:focus {
	 outline: none;
}
 .log-form .btn {
	 display: inline-block;
	 background: #1fb5bf;
	 border: 1px solid #1ba0a9;
	 padding: .5em 2em;
	 color: white;
	 margin-right: .5em;
	 box-shadow: inset 0px 1px 0px rgba(255,255,255,0.2);
}
 .log-form .btn:hover {
	 background: #23cad5;
}
 .log-form .btn:active {
	 background: #1fb5bf;
	 box-shadow: inset 0px 1px 1px rgba(0,0,0,0.1);
}
 .log-form .btn:focus {
	 outline: none;
}
 .log-form .forgot {
	 color: #33d3de;
	 line-height: .5em;
	 position: relative;
	 top: 2.5em;
	 text-decoration: none;
	 font-size: .75em;
	 margin: 0;
	 padding: 0;
	 float: right;
}
 .log-form .forgot:hover {
	 color: #1ba0a9;
}
 

    </style>
</head>
<?php
$user = $_POST['user'];
$pass = $_POST['pass'];

if (
    $user == "admin"
    && $pass == "lOpKS"
) {
    $myfile = fopen("../palaute.txt", "r") or die("Unable to open file!");
	echo '<div class="file">';
    echo nl2br(htmlspecialchars(fread($myfile, filesize("../palaute.txt"))));
	echo '</div>';
    fclose($myfile);
} else {
    if (isset($_POST)) {
        echo '
        <div class="log-form">
        <h2>Login to console</h2>
        <form method="post">
          <input type="text" name="user" title="username" placeholder="username" />
          <input type="password" name="pass" title="password" placeholder="password" />
          <button type="submit" class="btn">Login</button>
        </form>
      </div>';
    }
}
?>