const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

router.route('/search').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationSearchVersion(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;s
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchVersion' } });
        });
    }
});

const operationSearchVersion = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    if(!helper.validateRequestObj(requestBody, ['cpais'])){ return { status: false, code: 400, message: 'Required params not found.' }; }
    let searchData = {
        cpais: requestBody.cpais,
        cmarca: requestBody.cmarca ? requestBody.cmarca : undefined,
        cmodelo: requestBody.cmodelo ? requestBody.cmodelo : undefined,
        xversion: requestBody.xversion ? requestBody.xversion.toUpperCase() : undefined
    }
    let searchVersion = await bd.searchVersionQuery(searchData).then((res) => res);
    if(searchVersion.error){ return { status: false, code: 500, message: searchVersion.error }; }
    if(searchVersion.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < searchVersion.result.recordset.length; i++){
            jsonList.push({
                cversion: searchVersion.result.recordset[i].CVERSION,
                xversion: searchVersion.result.recordset[i].XVERSION,
                cmodelo: searchVersion.result.recordset[i].CMODELO,
                xmodelo: searchVersion.result.recordset[i].XMODELO,
                casociado: searchVersion.result.recordset[i].CASOCIADO,
                cmarca: searchVersion.result.recordset[i].CMARCA,
                xmarca: searchVersion.result.recordset[i].XMARCA,
                bactivo: searchVersion.result.recordset[i].BACTIVO
            });
        }
        return { status: true, list: jsonList };
    }else{ return { status: false, code: 404, message: 'Model not found.' }; }
}

router.route('/create').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCreateVersion(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreateVersion' } });
        });
    }
});

const operationCreateVersion = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    if(!helper.validateRequestObj(requestBody, ['xversion', 'cmodelo', 'cmarca', 'casociado', 'ctipotransmision', 'xcilindrajemotor', 'ctipovehiculo', 'ncapacidadcarga', 'npasajero', 'bactivo', 'cpais', 'cusuariocreacion'])){ return { status: false, code: 400, message: 'Required params not found.' }; }
    let versionData = {
        xversion: requestBody.xversion.toUpperCase(),
        ctipotransmision: requestBody.ctipotransmision,
        xcilindrajemotor: requestBody.xcilindrajemotor.toUpperCase(),
        ctipovehiculo: requestBody.ctipovehiculo,
        ncapacidadcarga: requestBody.ncapacidadcarga,
        npasajero: requestBody.npasajero,
        cmodelo: requestBody.cmodelo,
        bactivo: requestBody.bactivo,
        cpais: requestBody.cpais,
        cmarca: requestBody.cmarca,
        casociado: requestBody.casociado,
        cusuariocreacion: requestBody.cusuariocreacion
    };
    let verifyVersionName = await bd.verifyVersionNameToCreateQuery(versionData).then((res) => res);
    if(verifyVersionName.error){ return { status: false, code: 500, message: verifyVersionName.error }; }
    if(verifyVersionName.result.rowsAffected > 0){ return { status: false, code: 200, condition: 'version-name-already-exist' }; }
    else{
        let createVersion = await bd.createVersionQuery(versionData).then((res) => res);
        if(createVersion.error){ return { status: false, code: 500, message: createVersion.error }; }
        if(createVersion.result.rowsAffected > 0){ return { status: true, cversion: createVersion.result.recordset[0].CVERSION }; }
        else{ return { status: false, code: 500, message: 'Server Internal Error.', hint: 'createVersion' }; }
    }
}

router.route('/detail').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationDetailVersion(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationDetailVersion' } })
        });
    }
});

const operationDetailVersion = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    if(!helper.validateRequestObj(requestBody, ['cpais', 'cversion'])){ return { status: false, code: 400, message: 'Required params not found.' }; }
    let versionData = {
        cpais: requestBody.cpais,
        cversion: requestBody.cversion
    };
    let getVersionData = await bd.getVersionDataQuery(versionData).then((res) => res);
    if(getVersionData.error){ return { status: false, code: 500, message: getVersionData.error }; }
    if(getVersionData.result.rowsAffected > 0){
        return { 
            status: true,
            cmodelo: getVersionData.result.recordset[0].CVERSION,
            xversion: getVersionData.result.recordset[0].XVERSION,
            ctipotransmision: getVersionData.result.recordset[0].CTIPOTRANSMISION,
            xcilindrajemotor: getVersionData.result.recordset[0].XCILINDRAJEMOTOR,
            ctipovehiculo: getVersionData.result.recordset[0].CTIPOVEHICULO,
            ncapacidadcarga: getVersionData.result.recordset[0].NCAPACIDADCARGA,
            npasajero: getVersionData.result.recordset[0].NPASAJERO,
            cmodelo: getVersionData.result.recordset[0].CMODELO,
            bactivo: getVersionData.result.recordset[0].BACTIVO,
            cmarca: getVersionData.result.recordset[0].CMARCA,
            casociado: getVersionData.result.recordset[0].CASOCIADO
        }
    }else{ return { status: false, code: 404, message: 'Version not found.' }; }
}

router.route('/update').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationUpdateVersion(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationUpdateVersiob' } })
        });
    }
});

const operationUpdateVersion = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    if(!helper.validateRequestObj(requestBody, ['cversion', 'xversion', 'cmodelo', 'cmarca', 'casociado', 'ctipotransmision', 'xcilindrajemotor', 'ctipovehiculo', 'ncapacidadcarga', 'npasajero', 'bactivo', 'cpais', 'cusuariomodificacion'])){ return { status: false, code: 400, message: 'Required params not found.' }; }
    let versionData = {
        cversion: requestBody.cversion,
        xversion: requestBody.xversion.toUpperCase(),
        ctipotransmision: requestBody.ctipotransmision,
        xcilindrajemotor: requestBody.xcilindrajemotor.toUpperCase(),
        ctipovehiculo: requestBody.ctipovehiculo,
        ncapacidadcarga: requestBody.ncapacidadcarga,
        npasajero: requestBody.npasajero,
        cmodelo: requestBody.cmodelo,
        bactivo: requestBody.bactivo,
        cpais: requestBody.cpais,
        cmarca: requestBody.cmarca,
        casociado: requestBody.casociado,
        cusuariomodificacion: requestBody.cusuariomodificacion
    };
    let verifyVersionName = await bd.verifyVersionNameToUpdateQuery(versionData).then((res) => res);
    if(verifyVersionName.error){ return { status: false, code: 500, message: verifyVersionName.error }; }
    if(verifyVersionName.result.rowsAffected > 0){ return { status: false, code: 200, condition: 'version-name-already-exist'}; }
    else{
        let updateVersion = await bd.updateVersionQuery(versionData).then((res) => res);
        if(updateVersion.error){ return { status: false, code: 500, message: updateVersion.error }; }
        if(updateVersion.result.rowsAffected > 0){ return { status: true, cversion: versionData.cversion }; }
        else{ return { status: false, code: 404, message: 'Model not found.' }; }
    }
}

module.exports = router;