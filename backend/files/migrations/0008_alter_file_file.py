# Generated by Django 4.2.4 on 2023-09-07 04:49

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("files", "0007_alter_file_file"),
    ]

    operations = [
        migrations.AlterField(
            model_name="file",
            name="file",
            field=models.FileField(
                upload_to="files/storages/<django.db.models.query_utils.DeferredAttribute object at 0x000001EB59C881F0>/"
            ),
        ),
    ]
