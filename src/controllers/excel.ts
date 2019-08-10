import { Response, Request, NextFunction } from "express";
import async from "async";
import fs from "fs";
import XLSX from "xlsx";
import * as http from '../util/http';
import * as secrets from '../util/secrets';

export const postExcelToJson = (req: Request, res: Response) => {

    var filesArray: any = req.files;
    var obj: any = {};
    async.each(filesArray, function (file: any, eachcallback) {
        //carry out your file operations here and pass callback at the end

        console.log(file);
        obj.fileName = file.originalname;

        var workbook = XLSX.readFile(file.path);
        var sheetNameList = workbook.SheetNames;
        obj = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

        // remove temp file
        try {
            fs.unlinkSync(file.path);
        } catch (e) {
            //error deleting the file
        }
    }, function (err) {
        if (err) {
            console.log("error ocurred in each", err);
        }
        else {
            console.log("finished prcessing");
            res.send({
                "code": "200",
                "success": "files printed successfully"
            });

        }
    });

    res.send(obj);
};

export const postExcelToGithub = async (req: Request, res: Response) => {

    var projectName = req.body.projectName;
    var templateName = req.body.templateName;
    var filesArray: any = req.files;

    var jsons: Array<{ name: string, content: any }> = [];
    async.each(filesArray, function (file: any, eachcallback) {
        //carry out your file operations here and pass callback at the end
        console.log(file);

        var workbook = XLSX.readFile(file.path);
        var sheetNameList = workbook.SheetNames;
        sheetNameList.forEach((value, index) => {
            jsons.push({

                name: value,
                content: new Buffer(JSON.stringify(XLSX.utils.sheet_to_json(workbook.Sheets[value]))).toString("base64")
            });
        })

        // remove temp file
        try {
            fs.unlinkSync(file.path);
        } catch (e) {
            //error deleting the file
        }
    }, function (err) {
        if (err) {
            console.log("error ocurred in each", err);
        }
        else {
            console.log("finished prcessing");
            res.send({
                "code": "200",
                "success": "files printed successfully"
            });

        }
    });

    // check if github repo is already available
    var isExistARes = await http.get(`${secrets.v3_endpoint}repos/${secrets.targetOwner}/${projectName}`,
        {
            Authorization: `token ${secrets.ACCESS_TOKEN}`,
            Accept: 'application/vnd.github.baptiste-preview+json'
        }
    );

    // when not 
    if (isExistARes.statusCode == 404) {
        // create repo from the intended template
        var repoRes = await http.post(
            `${secrets.v3_endpoint}repos/${secrets.templateOwner}/${templateName}/generate`,
            {
                "name": projectName
            },
            {
                Authorization: `token ${secrets.ACCESS_TOKEN}`,
                Accept: 'application/vnd.github.baptiste-preview+json'
            }
        );

        // enable gh-pages
        if (repoRes) {
            var isGhPagesEnabledRes = await http.post(
                `${secrets.v3_endpoint}repos/${secrets.templateOwner}/${projectName}/pages`,
                {
                    "source": {
                        "branch": "master",
                        "path": ""
                    }
                },
                {
                    Authorization: `token ${secrets.ACCESS_TOKEN}`,
                    Accept: 'application/vnd.github.switcheroo-preview+json'
                }
            );
            // console.log(isGhPagesEnabledRes);
        }
    }

    else if (isExistARes.statusCode == 200) {
        // do nothing
    } else {
        console.log('unexpected condition');
    }

    // push json files into assets of the target repo

    async.each(jsons, async (jsonObj, index) => {

        try {

            var isFileUploaded = await http.put(
                `${secrets.v3_endpoint}repos/${secrets.targetOwner}/${projectName}/contents/Assets/Jsons/${jsons[0].name}.json`,
                {
                    "message": `Added ${jsons[0].name}`,
                    "content": jsons[0].content
                },
                {
                    Authorization: `token ${secrets.ACCESS_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            );
            // console.log(isFileUploaded);
        } catch (ex) {
            console.log(ex);
        }

    });

    res.send(jsons);
};

export const postTest = (req: Request, res: Response) => {
    res.send({
        "t": "Yo!"
    });
};