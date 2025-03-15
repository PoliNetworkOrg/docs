import os
import mysql.connector as database
import json

connection = database.connect(
    user='root',
    password='',
    host="localhost",
    database="DBPolifemo"
)

cursor = connection.cursor()

with open("groups.json", 'r', encoding='cp850') as f:
    text = f.read()
    groups = json.loads(text)
    data = groups["index_data"]
    for i in range(len(data)):        
        try:
            if data[i]["degree"] == None:
                 data[i]["degree"]=""
                 
            if data[i]["school"] == None:
                 data[i]["school"]=""
            
            if data[i]["year"] == None:
                 data[i]["year"]=""
            
            if data[i]["permanentId"] == None:
                 data[i]["permanentId"]=''
            
            if data[i]["linkfunzionante"] == None:
                 data[i]["linkfunzionante"]=""

            if data[i]["language"] == 'EN' : 
                 data[i]["language"]='ENG'
                 
            if data[i]["language"] == 'IT' : 
                 data[i]["language"]='ITA'

            data[i]["class"] = json.dumps(data[i]["class"])
            data[i]["id"] = json.dumps(data[i]["id"])
            data[i]["id_link"] = json.dumps(data[i]["id_link"])
                 
            string = "INSERT IGNORE INTO gruppo VALUES ("+ data[i]["class"]  + ", '"+ data[i]["office"]  + "', "+ data[i]["id"]  + ", '"+ data[i]["degree"]  + "','"+ data[i]["school"]  + "',"+ data[i]["id_link"]  + ",'"+ data[i]["language"]  + "','"+ data[i]["type"]  + "', '"+ data[i]["year"]  + "', '"+ data[i]["platform"]  + "', '"+ data[i]["permanentId"]  + "', '"+ data[i]["LastUpdateInviteLinkTime"]  + "', '"+ data[i]["linkfunzionante"]  + "');";
            replace = string.replace("''", "NULL")
            cursor.execute(replace)
            connection.commit()
        except database.Error as e:
           print(f"Error retrieving entry from database: {e}")
           print(replace)
        except Exception as e:
            print(f"string error: {e}")
            print(data[i]["class"])
        
