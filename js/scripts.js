class Transformer {
  constructor(localization = {}) {
    this.localization = localization;
    this.result = {};
  }
  
  getResult() {
  	return Object.values(this.result);
  }
  
  clearResult() {
  	this.result = {};
  }
  
  pushDataToResult(data) {
    let value = `value${data.index+1}`;
    if (typeof this.result[data.fullKey] === 'object') {
      this.result[data.fullKey][value] = data.value;
    } else {
      const localizedLabel = this.localization[data.fullKey] ? this.localization[data.fullKey] : data.shortKey;
    	this.result[data.fullKey] = {
      	'name': localizedLabel,
      };
      this.result[data.fullKey][value] = data.value
    }
  }
  
  trasnformArray(items, rules, parentKey = '') {
    items.forEach((item,index) => {
      let objectIndex = index
      this.transformObject(item, rules, parentKey, objectIndex);
    });
  }
  
	transformObject(item, rules, parentKey = '', objectIndex) {
    Object.keys(item).forEach(property => {      
      this.transformProperty(property, item[property], rules, parentKey, objectIndex);
    });
  }

	transformProperty(property, data, rules, parentKey = '', objectIndex) {
    if (typeof(rules[property]) !== 'object' && !rules[property]) {
      return; 
    }
    let transformedValue = null;
    const currentKey = parentKey ? parentKey + '.' + property : property;
    if (data instanceof Date) {
      transformedValue = this.formatDate(data);
    } else if (typeof(data) === 'boolean') {
      transformedValue = data ? 'Так' : 'Ні';
    } else if (data instanceof Array) {
      transformedValue = data.join(', ')
      this.trasnformArray(data, rules[property], currentKey);
    } else if (typeof(data) === 'object') {
      this.transformObject(data, rules[property], currentKey, objectIndex);
    } else {
      transformedValue = data;
    }
    if (transformedValue !== null) {
    	this.pushDataToResult({
        shortKey: property, // is used when localization not found
        fullKey: currentKey,
        value: transformedValue,
        index: objectIndex,
      });
    }
  }
  
  formatDate(date){
    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
  
    var MM = date.getMonth() + 1;
    if (MM < 10) MM = '0' + MM;
  
    var yyyy = date.getFullYear() ;
  
    return `${dd}.${MM}.${yyyy}`
  }
}

// test data example
const data = [
  {
    fullName: {surname : 'xxx', firstName : 'yyy', middleName: 'zzz'}, 
    age: 23, 
    birthDate: 
    new Date('01-31-2017'), 
    isSmoking: false
  },
  {
    fullName : {surname : 'XXX', firstName : 'YYY', middleName: 'ZZZ'}
  },
  {
    testField: 'does not exist anywhere'
  },
  {
    fullName: {surname : 'Smith', firstName : 'John', middleName: 'Ivanovich'},
    job: {
      title: "Software developer",
      skills: ['js', 'css', 'html'],
      expectations: {
        shortTerm: "good salary",
        longTerm: "become a boss",
      }
    },
  },
];

const transformationRules = {
  fullName: {
  	surname: true,
    firstName: true,
    middleName: false
  },
  age: true,
  birthDate: true,
  isSmoking: true,
  children: true,
  job: {
    title: true,
    skills: true,
    expectations: {
        shortTerm: true,
        longTerm: true,
      }
  }
};

const localization = {"fullName.surname" : "Прізвище", "fullName.middleName" : "По-батькові", "job.expectations.shortTerm": "Короткострокові очікування"} ;

const dataTransformer = new Transformer(localization);
dataTransformer.trasnformArray(data, transformationRules);
console.log(dataTransformer.getResult());