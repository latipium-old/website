// Entry.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using log4net;
using Com.Latipium.Website.Honey.BanApplyer;
using Com.Latipium.Website.Honey.Model;

namespace Com.Latipium.Website.Honey {
	public static class Entry {
		private static readonly ILog Log = LogManager.GetLogger(typeof(Entry));

		public static void Main(string[] args) {
			Log.Info("Starting Latipium Honey Server...");
			using ( DataContext db = new DataContext() ) {
				List<HoneyListener> listeners = new List<HoneyListener>();
				ConnectionHandler handler = new ConnectionHandler(db);
				foreach ( Type type in Assembly.GetCallingAssembly()
					.DefinedTypes
					.Where(
						t => typeof(IHoneyProtocol).IsAssignableFrom(t))
					.Except(new Type[] {
						typeof(IHoneyProtocol),
						typeof(AbstractHoneyProtocol)
					}) ) {
					listeners.Add(
						new HoneyListener((IHoneyProtocol) type.GetConstructor(new Type[0])
							.Invoke(new object[0]), handler, db));
				}
				Log.Info("Loaded server with configuration:");
				foreach ( HoneyListener listener in listeners ) {
					Log.InfoFormat("  - Protocol \"{0}\" (std. port {1}) on port {2}", listener.Protocol.Name, listener.Protocol.Port, listener.Port);
				}
				ApplyingSubsystem.Run(db);
			}
		}
	}
}

