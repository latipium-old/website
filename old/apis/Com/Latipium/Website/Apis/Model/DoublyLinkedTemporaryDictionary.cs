// DoublyLinkedTemporaryDictionary.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;

namespace Com.Latipium.Website.Apis.Model {
	public class DoublyLinkedTemporaryDictionary<TKey, TValue> : TemporaryDictionary<TKey, TValue> {
		private DoublyLinkedTemporaryDictionary<TValue, TKey> Reverse;

		private void _this_set(TKey key, TValue value) {
			base[key] = value;
		}

		public override TValue this[TKey key] {
			get {
				return base[key];
			}
			set {
				_this_set(key, value);
				if ( Reverse != null ) {
					Reverse._this_set(value, key);
				}
			}
		}

		private void _Add(KeyValuePair<TKey, TValue> item) {
			base.Add(item);
		}

		public override void Add(KeyValuePair<TKey, TValue> item) {
			_Add(item);
			if ( Reverse != null ) {
				Reverse._Add(new KeyValuePair<TValue, TKey>(item.Value, item.Key));
			}
		}

		private void _Add(TKey key, TValue value) {
			base.Add(key, value);
		}

		public override void Add(TKey key, TValue value) {
			_Add(key, value);
			if ( Reverse != null ) {
				Reverse._Add(value, key);
			}
		}

		private void _Clear() {
			base.Clear();
		}

		public override void Clear() {
			_Clear();
			if ( Reverse != null ) {
				Reverse._Clear();
			}
		}

		private void _Dispose(bool disposing) {
			base.Dispose(disposing);
		}

		protected override void Dispose(bool disposing) {
			_Dispose(disposing);
			if ( Reverse != null ) {
				Reverse._Dispose(disposing);
			}
		}

		private bool _Remove(KeyValuePair<TKey, TValue> item) {
			return base.Remove(item);
		}

		public override bool Remove(KeyValuePair<TKey, TValue> item) {
			try {
				return _Remove(item);
			} finally {
				if ( Reverse != null ) {
					Reverse._Remove(new KeyValuePair<TValue, TKey>(item.Value, item.Key));
				}
			}
		}

		private bool _Remove(TKey key) {
			return base.Remove(key);
		}

		public override bool Remove(TKey key) {
			TValue val;
			if ( TryGetValue(key, out val) ) {
				_Remove(key);
				if ( Reverse != null ) {
					Reverse._Remove(val);
				}
				return true;
			} else {
				return false;
			}
		}

		public DoublyLinkedTemporaryDictionary(int keepTime, DoublyLinkedTemporaryDictionary<TValue, TKey> other = null) : base(keepTime) {
			Reverse = other;
			if ( Reverse != null ) {
				Reverse.Reverse = this;
			}
		}
	}
}

