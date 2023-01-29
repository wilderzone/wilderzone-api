# Wilderzone API
Web interface for easy access to the TA Network API.

https://api.wilderzone.live/

| Endpoint |	Modifiers |	Description |
| -------- | ---------- | ----------- |
| [/online/players](https://api.wilderzone.live/online/players) |	`?simple`	             | All players currently in-game. |
| [/online/servers](https://api.wilderzone.live/online/servers) | `?simple` `?populated` | All game servers currently online. |
| [/history/players](https://api.wilderzone.live/history/players) |	`?from=<timestamp>` `?to=<timestamp>` `?interval=<minutes>` | A history of the total number of online players. |
| [/news](https://api.wilderzone.live/news)	| `?latest` | News from the Wilderzone. |


*All data is provided as JSON.*
