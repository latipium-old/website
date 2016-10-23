// ISubsystem.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using Com.Latipium.Website.Apis.Model;

namespace Com.Latipium.Website.Apis {
	public interface ISubsystem {
		Storage Database {
			get;
			set;
		}

		string Name {
			get;
		}

		void Init();

		void Start();
	}
}

