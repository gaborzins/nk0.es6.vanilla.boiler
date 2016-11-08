/*
 * Copyright (c) 2016, Coates Group, Pty Ltd.
 * All rights reserved.
 *
 * @Author: gabor.zins@coatesgroup.com
 * @Class: 	CFS (Crew Facing Screen)
 * 
 * 
 */

import * as test2 from "./test2"

// Enforce Singleton
let instance = null;

console.info("TEST !!!!788788888");

class CFS{
	constructor(){
		if(!instance){
			instance = this;
		}
		console.info("CFS Constructor ", Math.random()*100);
		return instance;
	}

	testme(){
		//test2.add(5,3);
	}
}

