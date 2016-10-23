// ConnectionHandler.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Linq;
using Com.Latipium.Website.Honey.BanApplyer;
using Com.Latipium.Website.Honey.Linq;
using Com.Latipium.Website.Honey.Model;

namespace Com.Latipium.Website.Honey {
	public class ConnectionHandler {
		private readonly DataContext Database;

		public TimeSpan GetBanLength(IEnumerable<Offence> oldOffences, Offence newOffence) {
			//return new TimeSpan(oldOffences.Count() + 1, 0, 0, 0);
			return new TimeSpan(0, 1, 0);
		}

		public string Handle(string ip, Protocol protocol) {
			Host host;
			if ( (host = Database.Hosts
				.FirstOrDefault(
					h => h.Hostname == ip &&
					h.IsIP)) == null ) {
				host = new Host();
				host.Hostname = ip;
				host.IsIP = true;
				Database.Hosts.Add(host);
			}
			Offence offence = new Offence();
			offence.Host = host;
			offence.Protocol = protocol;
			offence.Time = DateTime.UtcNow;
			TimeSpan len = GetBanLength(Database.Offences
				.Where(
					o => o.HostRefId == host.Id), offence);
			host.BanEnd = DateTime.UtcNow.Add(len).Ticks;
			Database.Offences.Add(offence);
			Database.SaveChanges();
			ApplyingSubsystem.ApplySingle(host);
			return string.Format("Thank you for adding your IP to the database of banned IP addresses." +
				"  The IP \"{0}\" has been marked as malicious." +
				"  Your IP has been banned from all non-cached webpages and will be required to complete a captcha to access cached webpages." +
				"  This ban will be lifted in {1}." +
				"  Repeated offenses will increase this time.", ip, len.ToHumanReadableString());
		}

		public ConnectionHandler(DataContext db) {
			Database = db;
		}
	}
}

