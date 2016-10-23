// _bc76d87c.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
//
// This code was auto-generated from commit bc76d87c:
namespace Com.Latipium.Website.Apis.Model.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _bc76d87c : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Profiles",
                c => new
                    {
                        UserId = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                        DisplayName = c.String(unicode: false),
                    })
                .PrimaryKey(t => t.UserId);
            
            CreateTable(
                "dbo.Users",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                        Name = c.String(unicode: false),
                        Email = c.String(unicode: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Profiles", t => t.Id)
                .Index(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Users", "Id", "dbo.Profiles");
            DropIndex("dbo.Users", new[] { "Id" });
            DropTable("dbo.Users");
            DropTable("dbo.Profiles");
        }
    }
}

