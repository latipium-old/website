// SubsystemLoader.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis {
	public class SubsystemLoader : IEnumerable<ISubsystem> {
		private readonly ISubsystem[] Source;
		public readonly Assembly Assembly;

		public IEnumerator<ISubsystem> GetEnumerator() {
			return ((IEnumerable<ISubsystem>) Source).GetEnumerator();
		}

		IEnumerator IEnumerable.GetEnumerator() {
			return Source.GetEnumerator();
		}

		public void Init(Storage db) {
			foreach ( ISubsystem subsystem in this ) {
				subsystem.Database = db;
				subsystem.Init();
			}
		}

		public Thread[] Start() {
			return this.Select(s => {
				Thread t = new Thread(s.Start);
				t.Name = s.Name;
				t.Start();
				return t;
			}).ToArray();
		}

		public SubsystemLoader(Assembly assembly) {
			Assembly = assembly;
			Source = Assembly.GetExportedTypes()
				.Where(
					t => typeof(ISubsystem).IsAssignableFrom(t) && t != typeof(ISubsystem)
				).Select(
					t => t.GetConstructor(new Type[0])
					.Invoke(new object[0])
				).Cast<ISubsystem>()
				.ToArray();
		}
	}
}

