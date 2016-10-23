// ApplyingSubsystem.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using Com.Latipium.Website.Honey.Model;

namespace Com.Latipium.Website.Honey.BanApplyer {
	public static class ApplyingSubsystem {
		private static Thread SubsystemThread;
		private static List<IBanningSystem> BanningSystems;
		private static ConcurrentBag<Host> Updates;
		private static HashSet<string> Banned;

		private static void LoadBanningSystems() {
			foreach ( Type type in Assembly.GetCallingAssembly()
				.DefinedTypes
				.Where(
					t => typeof(IBanningSystem).IsAssignableFrom(t))
				.Except(new Type[] {
					typeof(IBanningSystem)
				}) ) {
				BanningSystems.Add((IBanningSystem) type.GetConstructor(new Type[0])
					.Invoke(new object[0]));
			}
		}

		public static void Ban(string IP) {
			if ( !Banned.Contains(IP) ) {
				Banned.Add(IP);
				foreach ( IBanningSystem sys in BanningSystems ) {
					sys.Ban(IP);
				}
			}
		}

		public static void LiftBan(string IP) {
			if ( Banned.Contains(IP) ) {
				Banned.Remove(IP);
				foreach ( IBanningSystem sys in BanningSystems ) {
					sys.LiftBan(IP);
				}
			}
		}

		public static void ApplySingle(Host host) {
			// Don't ban hostnames because they are scanners so they
			// should be banned already.
			if ( host.IsIP ) {
				Updates.Add(host);
				SubsystemThread.Interrupt();
			}
		}

		public static void Run(DataContext db) {
			SubsystemThread = Thread.CurrentThread;
			BanningSystems = new List<IBanningSystem>();
			Updates = new ConcurrentBag<Host>();
			Banned = new HashSet<string>();
			LoadBanningSystems();
			foreach ( IBanningSystem sys in BanningSystems ) {
				sys.Reset();
			}
			long update;
			long now = DateTime.UtcNow.Ticks;
			foreach ( Host host in db.Hosts
				.Where(
					h => h.BanEnd > now) ) {
				Updates.Add(host);
			}
			while ( true ) {
				now = DateTime.UtcNow.Ticks;
				update = now + ((long) int.MaxValue) * 10000000L;
				{
					Host host;
					while ( Updates.TryTake(out host) ) {
						if ( host.BanEnd > DateTime.UtcNow.Ticks ) {
							if ( host.BanEnd < update ) {
								update = host.BanEnd;
							}
							Ban(host.Hostname);
						} else {
							LiftBan(host.Hostname);
						}
					}
				}
				try {
					Thread.Sleep((int) ((update - now) / 10000000));
					foreach ( Host host in db.Hosts
						.Where(
							h => h.BanEnd > now) ) {
						Updates.Add(host);
					}
				} catch ( ThreadInterruptedException ) {
				}
			}
		}
	}
}

