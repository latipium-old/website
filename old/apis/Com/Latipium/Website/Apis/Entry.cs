// Entry.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Threading;
using log4net;
using Com.Latipium.Website.Apis.Model;
using Com.Latipium.Website.Apis.Model.Migrations;

namespace Com.Latipium.Website.Apis {
	public static class Entry {
		private static readonly ILog Log = LogManager.GetLogger(typeof(Entry));

		public static void Main(string[] args) {
			if ( args.Length == 1 && args[0] == "--add-migration" ) {
				MigrationGenerator.Main(args);
			} else {
				MigrationConfig config = new MigrationConfig();
				DbMigrator migrator = new DbMigrator(config);
				if ( migrator.GetPendingMigrations().Any() ) {
					Log.Info("Updating database...");
					foreach ( string migration in migrator.GetPendingMigrations() ) {
						Log.InfoFormat(" - {0}", migration);
					}
					migrator.Update();
				}
				Log.Info("Starting Latipium APIs server");
				using ( Storage db = new Storage() ) {
					db.Permanent.ActiveLoad();
					SubsystemLoader loader = new SubsystemLoader(typeof(Entry).Assembly);
					loader.Init(db);
					foreach ( Thread thread in loader.Start() ) {
						thread.Join();
					}
				}
				Log.Info("Latipium APIs server gracefully stopped");
			}
		}
	}
}

