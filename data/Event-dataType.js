IP = {
   ip: String("IP address"),
   resolved: String("Resolved DNS name (if known)"),
   country: String("Country code"),
   blacklisted: Integer("1 if IP addess is known to be blacklisted")
}

//priklad udalosti
Event = {
    "id": 232635,
    //cas udalosti
    "time": "2016-03-29 11:16:00",
    //zdrojova IP adresa
    "source": {
		"ip": "192.168.51.2",
		"resolved": "",
		"country": "LAN",
		"blacklisted": 0
	},
    //typ udalosti
    "type": "INSTMSG",
    //zdroj dat udalosti
    "nfSource": {
		"id": 1,
		"name": "Default",
		"virtual": 0
	},
    "batch": 1459242900,
    "flowStamp": "2016-03-29 11:16:00",
    //textovy detail
    "detail": "Skype protocol (Skype), unique servers: 1.",
    //pole cilovych IP adres
    "targets": [{
		"ip": "157.56.192.137",
		"resolved": "db3msgr6011412.gateway.messenger.live.com",
		"country": "US",
		"blacklisted": 0
	}],
    //zarazeni udalosti do perspektiv
    "perspectives": [{
		"id": 3,
		"name": "perspective_3",
		"priority": 4
	}, {
		"id": 4,
		"name": "perspective_4",
		"priority": 2
	}],
    "priority": 0,
    "interest": 1,
    "comments": []
}
