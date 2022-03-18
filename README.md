# oispaeliitti
Also check out the pure javascript implementation, [oispaelitti-ng](https://github.com/discapes/oispaeliitti-ng).

Features include:
- leaderboard with nicknames
- cookie authentication
- board resets that cost increasing motivation
- custom tiles
- keyboard friendly
- music from abitti
- sound effects

requires mysql, php8, apache and mod_rewrite
	
	CREATE DATABASE leaderboard;
	GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,ALTER
	ON leaderboard.*
	TO oispaeliitti@localhost
	IDENTIFIED BY 'dbpwd';
	FLUSH PRIVILEGES;	

	USE leaderboard; 
	CREATE TABLE `topscores` (
	 `uuid` varchar(13) NOT NULL,
	 `name` varchar(50) DEFAULT NULL,
	 `score` int(11) DEFAULT NULL
	) ENGINE=InnoDB DEFAULT CHARSET=latin1
Remember to `git update-index --assume-unchanged sql.php`.

Just do `AllowOverride FileInfo AuthConfig` and `Options FollowSymLinks`.
