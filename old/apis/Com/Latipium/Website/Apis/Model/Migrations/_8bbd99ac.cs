// _8bbd99ac.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
//
// This code was auto-generated from commit 8bbd99ac:
namespace Com.Latipium.Website.Apis.Model.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _8bbd99ac : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Authors",
                c => new
                    {
                        Id = c.Long(nullable: false, identity: true),
                        Namespace = c.String(maxLength: 128, storeType: "nvarchar"),
                        UserId = c.String(maxLength: 128, storeType: "nvarchar"),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Modules", t => t.Namespace)
                .ForeignKey("dbo.Users", t => t.UserId)
                .Index(t => t.Namespace)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.Modules",
                c => new
                    {
                        Namespace = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                    })
                .PrimaryKey(t => t.Namespace);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Authors", "UserId", "dbo.Users");
            DropForeignKey("dbo.Authors", "Namespace", "dbo.Modules");
            DropIndex("dbo.Authors", new[] { "UserId" });
            DropIndex("dbo.Authors", new[] { "Namespace" });
            DropTable("dbo.Modules");
            DropTable("dbo.Authors");
        }
    }
}

