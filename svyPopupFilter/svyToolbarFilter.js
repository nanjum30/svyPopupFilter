/**
 * @public 
 * Enum of all renderer form types available
 * @properties={typeid:35,uuid:"E4F70004-F7BE-4806-AC3C-F727EC06AF8F",variableType:-4}
 */
var FILTER_TYPES = {
	/**
	 * Date filter
	 * */
	DATE: 'datePopupFilterTemplate',
	/**
	 * Number filter
	 * */
	NUMBER: 'numberPopupFilterTemplate',
	/**
	 * Tokens filter
	 * */
	TOKEN: 'tokenPopupFilterTemplate',
	/**
	 * Select filter
	 * */
	SELECT: 'selectFilterTemplate'
};

/**
 * @type {String}
 * @private
 *
 * @properties={typeid:35,uuid:"472FF5A6-F073-4910-9CB1-565F46327D67"}
 */
var TOOLBAR_FILTER_NAME = "svy-toolbar-filter";

/**
 * cache locally the latest popup filter open, to be used in the callback method
 * @type {AbstractToolbarFilterUX}
 * @private 
 * @properties={typeid:35,uuid:"4E5DE070-8F3C-45A1-8804-15236FE03AAB",variableType:-4}
 */
var latestToolbarFilter = null;

/**
 * This is a Singleton
 * @type {PopupRendererForms}
 * @private  
 * @properties={typeid:35,uuid:"85FB53C2-C19C-419B-9F03-642998E3B1F4",variableType:-4}
 */
var popupRendererForms;

/**
 * This is a Singleton
 * @type {FilterConfig}
 * @private 
 * @properties={typeid:35,uuid:"9F30ABE1-06E5-4A81-BDAF-688EEE5A73F4",variableType:-4}
 */
var globalFilterConfig;

/**
 * @private 
 * @properties={typeid:24,uuid:"51DB1DD3-1632-4667-82F9-C2EF07BF1A5B"}
 */
function FilterConfig() {
	// TODO default auto-apply behavior
	// this.autoApply = true;
	
	this.useNonVisibleColumns = true;
	this.globalDateDisplayFormat = "dd-MM-yyyy";
}

/**
 * @since v1.1.0
 * @return {Boolean} Default true.
 * @private  
 * @properties={typeid:24,uuid:"CE62E19D-27B9-49C7-BD74-5B47D8F2F3B2"}
 */
function getConfigUseNonVisibleColumns() {
	return globalFilterConfig.useNonVisibleColumns;
}

/**
 * Use only visible columns of the grid when set to false
 * 
 * @since v1.1.0
 * @public 
 * @param {Boolean} useNonVisibleColumns Default true.
 *
 * @properties={typeid:24,uuid:"11013635-12DE-4CDF-9A28-57E9AC8784EB"}
 */
function setConfigUseNonVisibleColumns(useNonVisibleColumns) {
	 // TODO can i make it an UI property
	 globalFilterConfig.useNonVisibleColumns = useNonVisibleColumns;
}

/**
 * Sets global display date format to be used
 * 
 * @public 
 * @param {String} displayFormat
 *
 * @properties={typeid:24,uuid:"1637F3D9-CE2A-445C-B0C3-9150B13B75C7"}
 */
function setConfigDateDisplayFormat(displayFormat) {
	if(displayFormat != null && displayFormat.trim() != "")
		globalFilterConfig.globalDateDisplayFormat = displayFormat;
}

/**
 * @constructor 
 * @private   
 * @properties={typeid:24,uuid:"EA19BC69-1CA7-4C3A-B6F3-BB972688F4BD"}
 */
function PopupRendererForms() {
	/** 
	 * @protected
	 * @type {RuntimeForm<AbstractPopupFilter>} 
	 * */
	this.datePopupFilterTemplate = {template: forms.svyDatePopupFilter};
	/** 
	 * @protected
	 * @type {RuntimeForm<AbstractPopupFilter>} 
	 * */
	this.numberPopupFilterTemplate = {template: forms.svyNumberPopupFilter};
	/** 
	 * @protected
	 * @type {RuntimeForm<AbstractPopupFilter>} 
	 * */
	this.tokenPopupFilterTemplate = {template: forms.svyTokenPopupFilter};
	/** 
	 * @protected
	 * @type {RuntimeForm<AbstractLookup>} 
	 * */
	this.selectFilterTemplate = {template: forms.svySelectPopupFilter};
}

/**
 * @return {PopupRendererForms}
 * @protected 
 * @deprecated 
 * @properties={typeid:24,uuid:"BBACCB75-672F-4067-BE33-A14A7150496C"}
 */
function getPopupUIFormRendered() {
	return popupRendererForms;
}

/**
 * @return {PopupRendererForms}
 * @private  
 * @properties={typeid:24,uuid:"76C600A8-C6E6-4CDA-8CE1-7959A936BB36"}
 */
function getPopupRendererForms() {
	return popupRendererForms;
}

/**
 * @public 
 * Sets the renderer form for the given formType
 * @param {String} formType any of the FILTER_TYPES
 * @param {RuntimeForm<AbstractPopupFilter>|RuntimeForm<AbstractLookup>} form the form to set
 *
 * @properties={typeid:24,uuid:"D64D95B4-75A2-43D7-8D2E-1DFDEBBD64E1"}
 */
function setPopupRendererForm(formType, form) {
	popupRendererForms.setRendererForm(formType, form);
}

/**
 * @since v1.1.0
 * @public 
 * Sets the default operator for the given formType
 * 
 * Is possible to change the default operator used by the filters using the global setting _setPopupDefaultOperator_.
 * Each filter type can make use of a different set of operators; user enum scopes.svyPopupFilter.OPERATOR for available options.
 * Specifically
 * <br/>
 * <br/>
 *  - TOKEN: IS_IN(DEFAULT), LIKE, LIKE_CONTAINS<br/>
 *  - NUMBER: EQUALS(DEFAULT), BETWEEN, GREATER_EQUAL, GREATER_THEN, SMALLER_EQUAL, SMALLER_THEN<br/>
 *  - DATE: BETWEEN(DEFAULT), GREATER_EQUAL, SMALLER_EQUAL, EQUALS<br/>
 *  - SELECT: IS_IN(DEFAULT)<br/>
 *  <br/>
 * 
 * The TOKEN filter type used to search on TEXT fields by default will search for an exact match using the IS_IN clause. 
 * Is possible to change such behavior into a LIKE for SEARCH_WORD% or %SEARCH_WORD% by changing the default operator to LIKE or LIKE_CONTAINS.
 * 
 * @param {String} formType any of the FILTER_TYPES
 * @param {String} operator the default operator to be used. Use enum value from scopes.svyToolbarFilter.OPERATOR 
 * 
 * @example <pre>
 *  // change default operator for TEXT token filters.
 *  scopes.svyToolbarFilter.setPopupDefaultOperator(scopes.svyToolbarFilter.FILTER_TYPES.TOKEN, scopes.svyPopupFilter.OPERATOR.LIKE);
 * </pre>
 *
 * @properties={typeid:24,uuid:"C1D86EEE-BC55-473B-A6E7-D963E3B9866E"}
 */
function setPopupDefaultOperator(formType, operator) {
	popupRendererForms.setDefaultOperator(formType, operator);
}

/**
 * @constructor
 * @private
 * @properties={typeid:24,uuid:"37935D63-8170-4771-AB8E-B448458A08E5"}
 * @AllowToRunInFind
 */
function initPopupRendererForms() {
	PopupRendererForms.prototype = Object.create(PopupRendererForms.prototype);
	PopupRendererForms.prototype.constructor = PopupRendererForms;
	
	/** 
	 * Returns the renderer form for the given formType
	 * @param {String} formType any of the FILTER_TYPES
	 * @return {RuntimeForm<AbstractPopupFilter>|RuntimeForm<AbstractLookup>}
	 * @public
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.getRendererForm = function(formType) {
		/** @type {{template:RuntimeForm<AbstractPopupFilter>|RuntimeForm<AbstractLookup>}} */
		var result = this[formType];
		return result.template;
	}
	
	/** 
	 * Sets the renderer form for the given formType
	 * @param {String} formType any of the FILTER_TYPES
	 * @param {RuntimeForm<AbstractPopupFilter>|RuntimeForm<AbstractLookup>} form the form to set
	 * @return {PopupRendererForms}
	 * @public
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.setRendererForm = function(formType, form) {
		this[formType].template = form;
		return this;
	}	
	
	/** 
	 * Returns the default operator for the given formType
	 * @param {String} formType any of the FILTER_TYPES
	 * @return {String}
	 * @public
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.getDefaultOperator = function(formType) {
		/** @type {{template:RuntimeForm<AbstractPopupFilter>|RuntimeForm<AbstractLookup>, operator:String=}} */
		var result = this[formType];
		return result.operator;
	}
	
	/** 
	 * Sets the default operator for the given formType
	 * @param {String} formType any of the FILTER_TYPES
	 * @param {String} operator the operator to set
	 * @return {PopupRendererForms}
	 * @public
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.setDefaultOperator = function(formType, operator) {
		
		// check if operator is allowed
		var allowedOperators = [];
		var OPERATOR = scopes.svyPopupFilter.OPERATOR;
		switch (formType) {
		case FILTER_TYPES.TOKEN:
			allowedOperators = [OPERATOR.IS_IN, OPERATOR.LIKE, OPERATOR.LIKE_CONTAINS];
			break;
		case FILTER_TYPES.SELECT:
			allowedOperators = [OPERATOR.IS_IN];
			break;
		case FILTER_TYPES.NUMBER:
			allowedOperators = [OPERATOR.BETWEEN, OPERATOR.GREATER_EQUAL, OPERATOR.GREATER_THEN, OPERATOR.SMALLER_EQUAL, OPERATOR.SMALLER_THEN, OPERATOR.EQUALS];
			break;
		case FILTER_TYPES.DATE:
			allowedOperators = [OPERATOR.BETWEEN, OPERATOR.GREATER_EQUAL, OPERATOR.SMALLER_EQUAL, OPERATOR.EQUALS];
			break;
		default:
			break;
		}
		
		if (allowedOperators.indexOf(operator) == -1) {
			
			var allowed = [];
			for (var op in OPERATOR) {
				if (allowedOperators.indexOf(OPERATOR[op]) > -1) {
					allowed.push(op);
				}
			}
			throw "The given operator is not allowed for the given form type. Allowed operators for such formType are: " + allowed.join(", ");
		}
		
		this[formType].operator = operator;
		return this;
	}	
	
	
	/** 
	 * @return {RuntimeForm<AbstractPopupFilter>}
	 * @protected
	 * @deprecated use getRendererForm(FILTER_TYPES.DATE) instead
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.getDateUIFormRendered = function() {
		/** @type {RuntimeForm<AbstractPopupFilter>} */
		var result = this.getRendererForm(FILTER_TYPES.DATE);
		return result;
	}
	
	/** 
	 * @param {RuntimeForm<AbstractPopupFilter>} form
	 * @protected
	 * @deprecated use setRendererForm(FILTER_TYPES.DATE, form) instead
	 * @return {PopupRendererForms}
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.setDateUIFormRendered = function(form) {
		return this.setRendererForm(FILTER_TYPES.DATE, form);
	}
	
	/** 
	 * @return {RuntimeForm<AbstractPopupFilter>}
	 * @protected
	 * @deprecated use getRendererForm(FILTER_TYPES.NUMBER) instead
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.getNumberUIFormRendered = function() {
		/** @type {RuntimeForm<AbstractPopupFilter>} */
		var result = this.getRendererForm(FILTER_TYPES.NUMBER);
		return result;
	}
	
	/** 
	 * 
	 * @param {RuntimeForm<AbstractPopupFilter>} form
	 * @protected
	 * @deprecated use setRendererForm(FILTER_TYPES.DATE, form) instead
	 * @return {PopupRendererForms}
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.setNumberUIFormRendered = function(form) {
		return this.setRendererForm(FILTER_TYPES.NUMBER, form);
	}
	
	/** 
	 * @return {RuntimeForm<AbstractPopupFilter>}
	 * @protected
	 * @deprecated use getRendererForm(FILTER_TYPES.TOKEN) instead
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.getTokenUIFormRendered = function() {
		/** @type {RuntimeForm<AbstractPopupFilter>} */
		var result = this.getRendererForm(FILTER_TYPES.TOKEN);
		return result;
	}
	
	/** 
	 * @param {RuntimeForm<AbstractPopupFilter>} form
	 * @protected
	 * @deprecated use setRendererForm(FILTER_TYPES.TOKEN, form) instead
	 * @return {PopupRendererForms}
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.setTokenUIFormRendered = function(form) {
		return this.setRendererForm(FILTER_TYPES.TOKEN, form);
	}
	
	/** 
	 * @return {RuntimeForm<AbstractLookup>}
	 * @protected
	 * @deprecated use getRendererForm(FILTER_TYPES.SELECT) instead
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.getSelectUIFormRendered = function() {
		/** @type {RuntimeForm<AbstractLookup>} */
		var result = this.getRendererForm(FILTER_TYPES.SELECT);
		return result;
	}
	
	/** 
	 * @param {RuntimeForm<AbstractLookup>} form
	 * @protected
	 * @deprecated use setRendererForm(FILTER_TYPES.TOKEN, form) instead
	 * @return {PopupRendererForms}
	 * @this {PopupRendererForms} 
	 * */
	PopupRendererForms.prototype.setSelectUIFormRendered = function(form) {
		return this.setRendererForm(FILTER_TYPES.SELECT, form);
	}
}

/**
 * @param {RuntimeComponent} uiComponent
 * @param {RuntimeWebComponent<aggrid-groupingtable>} tableComponent
 * 
 * @private
 * @constructor
 * @this {AbstractToolbarFilterUX}
 * @properties={typeid:24,uuid:"D21B3F79-9C77-4006-8A82-95AA24DC56AA"}
 * @AllowToRunInFind
 */
function AbstractToolbarFilterUX(uiComponent, tableComponent) {
	
	/**
	 * @protected 
	 * @type {RuntimeComponent}
	 */
	this.element = uiComponent;
	
	/**
	 * @protected
	 * @type {String}
	 */
	this.elementName = uiComponent.getName();

	/**
	 * @protected
	 * @type {String}
	 */
	this.formName = uiComponent.getFormName();
	
	/**
	 * @protected
	 * @type {SvyGridFilters}
	 */
	this.svyGridFilters = new SvyGridFilters(tableComponent);

	/**
	 * @protected 
	 * @type {String}
	 */
	this.onFilterCreate = null;
	
	/**
	 * @protected
	 * @type {String}
	 */
	this.onFilterApplyEvent = null;
	
	/**
	 * @protected
	 * @type {String}
	 */
	this.onFilterAddedEvent = null;	
	
	/**
	 * @protected
	 * @type {String}
	 */
	this.onFilterRemovedEvent = null;
	
	// TODO allow the form to implement such funcitonalities

	// update grid filter

	// get filter tag/entry/index..

	// on click (show IT)

	// create filter
}

/**
 * Filter Toolbar implementation using the listcomponent from the custom-rendered-components package.
 * This implementation requires a "List Component" element and an "Data-Grid" element.
 * You should create a toolbar filter instance at the onLoad of your form and assign it to a form variable.
 * The "List Component" must have it's 'foundset' property set to '-none-'.
 * Make sure to re-direct the onClick event of the "List Component" to the toolbar.onClick(entry, index, dataTarget, event);
 * 
 * 
 * @constructor
 * @param {RuntimeWebComponent<customrenderedcomponents-listcomponent>} listComponent
 * @param {RuntimeWebComponent<aggrid-groupingtable>} table
 * 
 * @deprecated use ListComponentFilterRenderer instead
 *
 * @extends {AbstractToolbarFilterUX}
 * @this {ListComponentFilterRender}
 * @private
 * @example <pre>
 * //keep track of toolbarFilter object in a form variable
 * var toolbarFilter;
 * 
 * //init the toolbarFilter at the onLoad.
 * function onLoad(event) {
 *  toolbarFilter = new scopes.svyToolbarFilter.ListComponentFilterRender(elements.filterToolbar, elements.table)
 * }
 * 
 * //propagate the onClick event of the "List Component" to the toolbar filter.
 * function onClick(entry, index, dataTarget, event) {
 *  toolbarFilter.onClick(entry,index,dataTarget,event);
 * }
 * 
 * //optionally set a searchText for a cross-field search to further filter the result set
 * function search() {
 *  toolbarFilter.setSearchText(searchText);
 *  toolbarFilter.search();
 * }
 * </pre>
 * 
 * @properties={typeid:24,uuid:"3DA99E05-2496-479B-BAEC-761249725BA3"}
 * @SuppressWarnings(wrongparameters)
 */
function ListComponentFilterRender(listComponent, table) {
	return new ListComponentFilterRenderer(listComponent, table);
}

/**
 * Filter Toolbar implementation using the custom list from the custom-rendered-components package.
 * This implementation requires a "List Component" element and an "Data-Grid" element.
 * You should create a toolbar filter instance at the onLoad of your form and assign it to a form variable.
 * Make sure to re-direct the onClick event of the "List Component" to the toolbar.onClick(entry, index, dataTarget, event);
 * 
 * @constructor
 * 
 * @param {RuntimeWebComponent<customrenderedcomponents-customlist>|RuntimeWebComponent<customrenderedcomponents-customlist_abs>} listComponent
 * @param {RuntimeWebComponent<aggrid-groupingtable>|RuntimeWebComponent<aggrid-groupingtable_abs>} table
 *
 * @extends {AbstractToolbarFilterUX}
 * @this {ListComponentFilterRenderer}
 * @protected 
 * @example <pre>
 * //keep track of toolbarFilter object in a form variable
 * var toolbarFilter;
 * 
 * //init the toolbarFilter at the onLoad.
 * function onLoad(event) {
 *  toolbarFilter = new scopes.svyToolbarFilter.ListComponentFilterRenderer(elements.filterToolbar, elements.table)
 * }
 * 
 * //propagate the onClick event of the "List Component" to the toolbar filter.
 * function onClick(entry, index, dataTarget, event) {
 *  toolbarFilter.onClick(entry,index,dataTarget,event);
 * }
 * 
 * //optionally set a searchText for a cross-field search to further filter the result set
 * function search() {
 *  toolbarFilter.setSearchText(searchText);
 *  toolbarFilter.search();
 * }
 * </pre>
 * 
 * @properties={typeid:24,uuid:"8E1C5902-993A-4F97-98D1-676643FE105B"}
 */
function ListComponentFilterRenderer(listComponent, table) {
	if (!listComponent) {
		throw 'listComponent element is required';
	}
	
	if (!table) {
		throw 'table element is required';
	}
	
	if (listComponent.getElementType() != "customrenderedcomponents-listcomponent" && listComponent.getElementType() != "customrenderedcomponents-customlist") {
		throw "The given listComponent element should be an element of type customrenderedcomponents-customlist; check the 'Custom List' from the Custom Rendered Components package";
	}
	
	if (table.getElementType() != "aggrid-groupingtable") {
		throw "The given table element should be an element of type aggrid-groupingtable; check the 'Data Grid' from the NG Grids package";
	}
	
	AbstractToolbarFilterUX.call(this, listComponent, table);
	
	/**
	 * @protected 
	 * @type {RuntimeWebComponent<customrenderedcomponents-customlist>|RuntimeWebComponent<customrenderedcomponents-customlist_abs>}
	 */
	this.element = listComponent;
	
	/**
	 * @protected
	 * @type {String}
	 */
	this.elementName = listComponent.getName();

	/**
	 * @protected
	 * @type {String}
	 */
	this.formName = listComponent.getFormName();
	
	/**
	 * @protected
	 * @type {SvyGridFilters}
	 */
	this.svyGridFilters = new SvyGridFilters(table);
	
	//TODO: remove when old list component has finally disappeared
	if (listComponent.getElementType() == "customrenderedcomponents-listcomponent") {
		listComponent['entryRendererFunc'] = this.getRenderTemplate();
	} else {
		listComponent.entryRendererFunction = this.getRenderTemplate();
	}
	
	listComponent.addStyleClass("svy-toolbar-filter")
	listComponent.clear();
}

/**
 * @private   
 * @param {RuntimeWebComponent<aggrid-groupingtable>|RuntimeWebComponent<aggrid-groupingtable_abs>} table
 * @constructor
 * @properties={typeid:24,uuid:"A6E91332-3686-48ED-9D89-5B07B0925132"}
 * @AllowToRunInFind
 */
function SvyGridFilters(table) {
	
	/** @type {SvyGridFilters} */
	var thisInstance = this;
	
	/**
	 * @public
	 * @return {RuntimeWebComponent<aggrid-groupingtable>|RuntimeWebComponent<aggrid-groupingtable_abs>}
	 *
	 * @this {SvyGridFilters}
	 */
	this.getTable = function() {
		return table;
	}	
	
	/**
	 * @type {Boolean}
	 */
	this.autoApply = true;

	/**
	 * @protected
	 * @type {Object}
	 */
	this.toolbarFilters = new Object();

	/**
	 * @protected
	 * @type {String}
	 */
	this.tableName = table.getName();

	/**
	 * @protected
	 * @type {String}
	 */
	this.formName = table.getFormName();
	
	/**
	 * @protected
	 * @type {String}
	 */
	this.searchText = null;
		
	/**
	 * @protected
	 * @type {scopes.svySearch.SimpleSearch}
	 */
	this.simpleSearch = thisInstance.getDefaultSearch();
	
	/**
	 * @protected
	 * @type {function}
	 */
	this.onSearchCommand = null;
}

/**
 * @private 
 * @param {Array<scopes.svyPopupFilter.AbstractPopupFilter>} filters
 * @param {JSFoundSet} foundset
 * 
 * @return {QBSelect}
 *
 * @properties={typeid:24,uuid:"5B04853F-1A4F-4752-83E9-B332D697F935"}
 */
function getFilterQuery(filters, foundset) {
	var isFilterSet = false;

	var query = databaseManager.createSelect(foundset.getDataSource());

	for (var i = 0; i < filters.length; i++) {

		var filter = filters[i];
		var dp = filter.getDataProvider();
		if (!dp) {
			throw "dataprovider unknown";
		}

		var op = filter.getOperator();
		var values = filter.getValues();
		var useNot = false;
		var useIgnoreCase = true; // default to case -insensitive

		// Clean up values from empty values
		var qValues = values.filter(function(qv) {
			if (qv === undefined || qv === null || qv === '') {
				return false;
			} else {
				return true;
			}
		});
		
		//Dont use lower on date
		if(qValues.length && (qValues[0] instanceof Date || qValues[0] instanceof Number)) {
			useIgnoreCase = false;
		}
		
		if (useIgnoreCase != false) {
			// Clean up values from empty values
			qValues = qValues.map(function(qv) {
				if (qv instanceof String) {
					return qv.toLowerCase();
				} else {
					return qv;
				}
			});
		}

		// skip filter if no values
		if (!qValues || !qValues.length) {
			continue;
		}

		var value;
		var OPERATOR = scopes.svyPopupFilter.OPERATOR;

		switch (op) {
		case OPERATOR.EQUALS:

			if (qValues[0] && qValues[0] instanceof Date) {
				op = "between";
				/** @type {String} */
				var qDateValue = qValues[0];
				value = [scopes.svyDateUtils.toStartOfDay(new Date(qDateValue)), scopes.svyDateUtils.toEndOfDay(new Date(qDateValue))];
			} else {
				op = "eq";
				value = qValues[0];
			}
			break;
		case OPERATOR.GREATER_EQUAL:
			op = "ge";
			value = qValues[0];
			break;
		case OPERATOR.GREATER_THEN:
			op = "gt";
			value = qValues[0];
			break;
		case OPERATOR.SMALLER_EQUAL:
			op = "le";
			value = qValues[0];
			break;
		case OPERATOR.SMALLER_THEN:
			op = "lt";
			value = qValues[0];
			break;
		case OPERATOR.BETWEEN:
			// TODO should this be handled by the popup form instead !?
			if (qValues.length == 2) {
				op = "between";
				value = qValues;
			} else if (qValues.length == 1) {
				if (values[0] === undefined || values[0] === null || values[0] === '') {
					op = "lt";
				} else {
					op = "gt";
				}
				value = qValues[0];
			} else {
				throw "this should not happen";
			}

			break;
		case OPERATOR.IS_IN:
			op = "isin";
			value = qValues;
			break;
		case OPERATOR.LIKE:
			op = "like";
			value = qValues;
			
			// add wildcard
			if (value instanceof Array) {
				value = value.map(function(qv) {
					if (qv instanceof String) {
						return qv + "%";
					} else {
						return qv;
					}
				});
			} else if (value instanceof String) {
				value = value + "%"
			}			
			break;
		case OPERATOR.LIKE_CONTAINS:
			op = "like";
			value = qValues;
			
			// add wildcard
			if (value instanceof Array) {
				value = value.map(function(qv) {
					if (qv instanceof String) {
						return "%" + qv + "%";
					} else {
						return qv;
					}
				});
			} else if (value instanceof String) {
				value =  "%"+ value + "%"
			}			
			break;
		default:
			break;
		}

		/** @type {QBSelect} */
		var querySource = null;
		var aDP = dp.split('.');
		for (var j = 0; j < aDP.length - 1; j++) {
			querySource = querySource == null ? query.joins[aDP[j]] : querySource.joins[aDP[j]];
		}

		/** @type {QBColumn} */
		var whereClause = querySource == null ? query.columns[aDP[aDP.length - 1]] : querySource.columns[aDP[aDP.length - 1]];

		// do not lower case Dates.
		if (value instanceof Date) {
			useIgnoreCase = false;
		}
		
		if (useIgnoreCase != false) {
			whereClause = whereClause["lower"];
			if (value instanceof String) {
				/** @type {String} */
				var valueString = value;
				value = valueString.toLowerCase();
			} else if (value instanceof Array) {
				// Clean up values from empty values
				/** @type {Array} */
				var valueArray = value;
				value = valueArray.map(function(qv) {
					if (qv instanceof String) {
						return qv.toLowerCase();
					} else {
						return qv;
					}
				});
			}

		}
		if (useNot) {
			whereClause = whereClause["not"];
		}
		
		switch (op) {
		case "between":
			whereClause = whereClause[op](value[0], value[1]);
			break;
		case "like":
			if (value instanceof Array) {
				var or = query.or;
				for (var v = 0; v < value.length; v++) {
					or.add(whereClause[op](value[v]));
				}
				whereClause = or;
				break;
			}
			
			whereClause = whereClause[op](value);
			break;
		default:
			whereClause = whereClause[op](value);
			break;
		}
	
		
		//whereClause = op == "between" ? whereClause[op](value[0], value[1]) : whereClause[op](value);
		if (!isFilterSet) isFilterSet = true;
		/** @type {QBCondition} */
		var where = whereClause;
		query.where.add(where);

	}

	return query;
}

/**
 * @public
 * @param {Array<scopes.svyPopupFilter.AbstractPopupFilter>} filters
 * @param {JSFoundSet} foundset
 * 
 * @return {QBSelect}
 * 
 * @deprecated use AbstractToolbarFilterUX.applyFilters() instead
 *
 * @properties={typeid:24,uuid:"DE3A02D8-BD4A-42B7-9870-6E5BC70D9D2A"}
 */
function applyFilters(filters, foundset) {

	// remove previous filter
	foundset.removeFoundSetFilterParam(TOOLBAR_FILTER_NAME);

	// get the filter query
	var filterQuery;
	if (filters.length) {
		filterQuery = getFilterQuery(filters,foundset);
	
		// apply the query as filter
		foundset.addFoundSetFilterParam(filterQuery, TOOLBAR_FILTER_NAME);
	} else {
		// refresh foundset since filters have been removed
		foundset.loadRecords();
		filterQuery = foundset.getQuery();
	}
	return filterQuery;
}

/**
 * @public
 * @param {JSFoundSet} foundset
 * 
 * @deprecated 
 *
 * @properties={typeid:24,uuid:"9078E2C7-E065-4E71-B4AB-D0D6F9F896E8"}
 */
function clearFilters(foundset) {
	if (foundset.removeFoundSetFilterParam(TOOLBAR_FILTER_NAME)) {
		return foundset.loadRecords();
	}
	return false;
}

/**
 * Creates a filter toolbar implementation using the custom list from the custom-rendered-components package.<br><br>
 * 
 * This implementation expects an NG "Data Grid" table component and a "Custom List" component.<br><br>
 * 
 * The filters offered from this implementation are generated from the table provided as follows:
 * 
 * <ul><li>any column with its <code>filterType</code> property set to TEXT will be offered as a token popup, allowing the user to enter any number of Strings to match</li>
 * <li>any column with its <code>filterType</code> property set to TEXT and the <code>valuelist</code> will be offered as a lookup where the user can search for and select any number of values</li>
 * <li>any column with its <code>filterType</code> property set to NUMBER will be offered as a number filter with a number of operators</li>
 * <li>any column with its <code>filterType</code> property set to DATE will be offered as a date filter with a number of operators</li></ul>
 * 
 * You should create a toolbar filter instance at the onLoad of your form and assign it to a form variable.
 * 
 * Make sure to re-direct the onClick event of the "List Component" to the toolbar.onClick(entry, index, dataTarget, event);
 * 
 * @param {RuntimeWebComponent<customrenderedcomponents-customlist>|RuntimeWebComponent<customrenderedcomponents-customlist_abs>} listComponent
 * @param {RuntimeWebComponent<aggrid-groupingtable>|RuntimeWebComponent<aggrid-groupingtable_abs>} table
 *
 * @extends {AbstractToolbarFilterUX}
 * @this {ListComponentFilterRenderer}
 * @public
 * @example <pre>
 * //keep track of toolbarFilter object in a form variable
 * var toolbarFilter;
 * 
 * //init the toolbarFilter at the onLoad.
 * function onLoad(event) {
 *  toolbarFilter = scopes.svyToolbarFilter.createFilterToolbar(elements.filterToolbar, elements.table)
 * }
 * 
 * //propagate the onClick event of the "Custom List" component to the toolbar filter.
 * function onClick(entry, index, dataTarget, event) {
 *  toolbarFilter.onClick(entry, index, dataTarget, event);
 * }
 * 
 * //optionally set a searchText for a cross-field search to further filter the result set
 * function search() {
 *  toolbarFilter.search(searchText);
 * }
 * </pre>
 * 
 * @properties={typeid:24,uuid:"4BB94EC8-F877-445D-93E1-541F0A58D664"}
 */
function createFilterToolbar(listComponent, table) {
	return new ListComponentFilterRenderer(listComponent, table);
}

/**
 * @private 
 * @param headerTitle
 * @return {String}
 *
 * @properties={typeid:24,uuid:"CACDDD32-E443-413B-8229-578929CD7F20"}
 */
function getI18nText(headerTitle) {
	/** @type {String} */
	var text = headerTitle;
	if (text && text.indexOf("i18n:") == 0) {
		text = i18n.getI18NMessage(text.replace("i18n:",""))
	}
	return text;
}

/**
 * @constructor
 * @private
 * @properties={typeid:24,uuid:"924B1AFF-94F1-4808-ADDC-BB1F10516E5C"}
 * @AllowToRunInFind
 */
function initSvyGridFilters() {
	SvyGridFilters.prototype = Object.create(SvyGridFilters.prototype);
	SvyGridFilters.prototype.constructor = SvyGridFilters;
	
	/**
	 * @public 
	 * @param {Boolean} forceApply
	 * @return {QBSelect}
	 * 
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.applyFilters = function(forceApply) {
		var foundset = this.getFoundSet();
		var filters = this.getActiveFilters();
		
		// remove previous filter
		if ((this.autoApply === true || forceApply === true) && !this.onSearchCommand) {
			foundset.removeFoundSetFilterParam(TOOLBAR_FILTER_NAME);
		}
		
		// get the filter query
		var filterQuery;
		if (filters.length) {
			filterQuery = getFilterQuery(filters, foundset);
			
			// apply the query as filter
			// DO NOTHING if onSearchCommand is set
			if ((this.autoApply === true || forceApply === true) && !this.onSearchCommand) {
				foundset.addFoundSetFilterParam(filterQuery, TOOLBAR_FILTER_NAME);
			}
		} else {
			// refresh foundset since filters have been removed
	
			// if autoApply reload records and return the query
			if ((forceApply === true || this.autoApply === true) && !this.searchText) {
				foundset.loadRecords();
				return foundset.getQuery();
			}
			
			filterQuery = foundset.getQuery();			
		}
		
		// DO NOTHING if onSearchCommand is set
		//if ((forceApply === true || this.autoApply === true) && !this.searchText) {
		if ((forceApply === true || this.autoApply === true) && !this.onSearchCommand && !this.searchText) {
			foundset.loadRecords();
		}
		
		return filterQuery;
	}

	/**
	 * @public
	 * @return {SvyGridFilters}
	 *
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.setSearchText = function(searchText) {
		this.searchText = searchText;
		return this;
	}
	
	/**
	 * @public
	 * @param {function(QBSelect, JSFoundSet)} callback
	 * @return {SvyGridFilters}
	 *
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.setOnSearchCommand = function(callback) {
		this.onSearchCommand = callback;
		return this;
	}
	
	/**
	 * @public
	 * @return {String}
	 *
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.getSearchText = function() {
		return this.searchText;
	}	
	
	/**
	 * @public
	 * @return {scopes.svySearch.SimpleSearch}
	 *
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.getSimpleSearch = function() {
		return this.simpleSearch;
	}
	
	
	/** 
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * @public
	 * @return {scopes.svySearch.SearchProvider}
	 *
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.getSearchProvider = function(column) {
		return this.simpleSearch.getSearchProvider(column.dataprovider);
	}
	
	/**
	 * @public
	 * @return {JSFoundSet}
	 *
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.getFoundSet = function() {
		return this.getTable().myFoundset.foundset;
	}
	
	/**
	 * @public
	 * @return {Array<{text:String, 
	 * dataprovider:String, 
	 * id:String=, 
	 * columnIndex:Number
	 * }>}
	 *
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.getFilters = function() {
		

		var column;
		var filter;
		var filters = [];

		var table = this.getTable();
		var columns = table.columns;
		var useNonVisibleColumns = getConfigUseNonVisibleColumns();

		if (useNonVisibleColumns) {
			// scan all columns
			for (var index = 0; index < columns.length; index++) {
				column = columns[index];
				if (column.filterType && column.filterType != 'NONE') {
					filter = new Object();
					filter.text = getI18nText(column.headerTitle);
					filter.dataprovider = column.dataprovider;
					filter.id = column.id;
					filter.columnIndex = index;
					filters.push(filter);
				}
			}
		} else {
		
			// scan only visible columns. Access the column state
			var jsonState = table.getColumnState();
			if (jsonState) {
				/** @type {{columnState:Array}} */
				var state = JSON.parse(jsonState);
				/** @type {Array} */
				var colsState = state.columnState ? state.columnState : [];
				for (var j = 0; j < colsState.length; j++) {
					if (!colsState[j].hide) { // skip column if hidden
					
						// NEW API
						var colIndex = table.getColumnIndex(colsState[j].colId);
						column = columns[colIndex];
						if (column && column.filterType && column.filterType != 'NONE') {
							//visibleColumns.push(col.dataprovider);
							filter = new Object();
							filter.text = getI18nText(column.headerTitle);
							filter.dataprovider = column.dataprovider;
							filter.id = column.id;
							filter.columnIndex = colIndex;
							filters.push(filter);
						}
					}
				}
				
			} else {
				for (var i = 0; i < columns.length; i++) {
					column = columns[i];
					if (column.filterType && column.filterType != 'NONE' && column.visible) {
						filter = new Object();
						filter.text = column.headerTitle;
						filter.text = getI18nText(column.headerTitle);
						filter.dataprovider = column.dataprovider;
						filter.id = column.id;
						filter.columnIndex = i;
						filters.push(filter);
					}
				}
			}
		}
		
		return filters;
	}
	
	/**
	 * @public
	 * @return {Array<scopes.svyPopupFilter.AbstractPopupFilter>}
	 *
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.getActiveFilters = function() {
		/** @type {Array<scopes.svyPopupFilter.AbstractPopupFilter>} */
		var activeFilters = [];
		for (var dp in this.toolbarFilters) {
			/** @type {scopes.svyPopupFilter.AbstractPopupFilter} */
			var filter = this.toolbarFilters[dp];
			if (filter.getValues() && filter.getValues().length) {
				activeFilters.push(this.toolbarFilters[dp]);
			}
		}
		return activeFilters;
	}

	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * @public
	 * @return {Boolean}
	 *
	 * @this {SvyGridFilters}
	 *  */
	SvyGridFilters.prototype.hasActiveFilter = function(column) {
		return this.toolbarFilters[column.dataprovider] ? true : false;
	}

	/**
	 * @public 
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * @param {scopes.svyPopupFilter.AbstractPopupFilter} filter
	 *
	 * @properties={typeid:24,uuid:"7097146A-EDA1-4C7A-9A9F-58FAEC3D883B"}
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.addGridFilter = function(column, filter) {
		if (column.dataprovider) {
			this.toolbarFilters[column.dataprovider] = filter;
		}
	}
	
	/**
	 * @public 
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * @return {scopes.svyPopupFilter.AbstractPopupFilter}
	 *
	 * @properties={typeid:24,uuid:"7097146A-EDA1-4C7A-9A9F-58FAEC3D883B"}
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.getGridFilter = function(column) {
		/** @type {scopes.svyPopupFilter.AbstractPopupFilter} */
		var filter = this.toolbarFilters[column.dataprovider];
		return filter;
	}
	
	/**
	 * @public 
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 *
	 * @properties={typeid:24,uuid:"7097146A-EDA1-4C7A-9A9F-58FAEC3D883B"}
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.removeGridFilter = function(column) {
		var toolbarFilter = this.toolbarFilters[column.dataprovider];
		var hasValues = toolbarFilter && toolbarFilter.getValues().length > 0 ? true : false;
		// remove the filter from cache
		delete this.toolbarFilters[column.dataprovider];	
		if (hasValues) {
			this.search()
		}
	}

	
	/**
	 * @public 
	 *
	 * @properties={typeid:24,uuid:"7097146A-EDA1-4C7A-9A9F-58FAEC3D883B"}
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.clearGridFilters = function() {

		// remove the filter from cache
		this.toolbarFilters = new Object();
		
		this.search();
	}
	
	
	/**
	 * @public 
	 * @return {Array<{
				id: String,
				dataprovider: String,
				operator: String,
				params: Object,
				text: String,
				values: Array}>}
	 *
	 * @properties={typeid:24,uuid:"7097146A-EDA1-4C7A-9A9F-58FAEC3D883B"}
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.getGridFiltersState = function() {
		
		var jsonState = [];
		for (var dp in this.toolbarFilters) {
			var filter = this.toolbarFilters[dp];
			
			var filterState = filter.getState();
			delete filterState.params;
			jsonState.push(filterState)
		}
		
		return jsonState;
	}

	/**
	 * @deprecated this function doesnt't work and is not used
	 * @protected  
	 * @param {Array<{
				id: String,
				dataprovider: String,
				operator: String,
				params: Object,
				text: String,
				values: Array}>} jsonState
	 *
	 * @properties={typeid:24,uuid:"7097146A-EDA1-4C7A-9A9F-58FAEC3D883B"}
	 * 
	 * @return {SvyGridFilters}
	 * @this {SvyGridFilters}
	 */
	SvyGridFilters.prototype.restoreGridFiltersState = function(jsonState) {
		
		// clear previous filters
		this.clearGridFilters();

		// restore new filters
		for (var i = 0; i < jsonState.length; i++) {
			var obj = jsonState[i];
			
			var column = this.getColumn(obj.dataprovider);
			if (column) {
				
				// FIXME check filter type
				var filter = new scopes.svyPopupFilter.SvyTokenFilter();
				filter.restoreState(obj);
			
				this.addGridFilter(column,filter);
			}
		}
		return this;
	}
	
	/**
	 * @public  
	 * @param {String} dataprovider
	 * @return {CustomType<aggrid-groupingtable.column>}
	 *
	 * @this {SvyGridFilters}
	 *  */
	SvyGridFilters.prototype.getColumn = function(dataprovider) {
		var columns = this.getTable().columns;
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			// TODO can i rely on dataprovider only !?
			if (dataprovider == column.dataprovider) {
				return column;
			}
		}
		return null;
	}
	
	/**
	 * @public
	 * @return {QBSelect}
	 * 
	 *
	 * @this {SvyGridFilters}
	 *  */
	SvyGridFilters.prototype.getQuery = function() {
		//apply foundset filters and force when the search text has been changed
		var filterQuery = this.applyFilters(this.searchText !== this.simpleSearch.getSearchText() ? true : false);

		var query;
		//quick search?
		if (this.searchText !== this.simpleSearch.getSearchText()) {
			this.simpleSearch.setSearchText(this.searchText);			
		}
		if (this.searchText) {
			
			// filters need to be applied
			if (this.onSearchCommand &&  this.getActiveFilters().length) {
				
				// include filters in query
				var foundset = databaseManager.getFoundSet(this.simpleSearch.getDataSource());
				var searchQuery = this.simpleSearch.getQuery();
				
				// add temp filters to make sure filterQuery is merged with searchQuery
				var toolbarFilterName = TOOLBAR_FILTER_NAME + "-temp";
				var searchFilterName = TOOLBAR_FILTER_NAME + "-temp-search";
				foundset.addFoundSetFilterParam(filterQuery, toolbarFilterName);
				foundset.addFoundSetFilterParam(searchQuery ,searchFilterName);
				foundset.loadRecords();
				
				query = foundset.getQuery();
				
				// remove filters from query
				foundset.removeFoundSetFilterParam(toolbarFilterName);
				foundset.removeFoundSetFilterParam(searchFilterName);
				foundset.loadRecords();

			} else {
				query = this.simpleSearch.getQuery();
			}
			

		} else {
			query = filterQuery;
		}
		
		return query;
	}
	
	/**
	 * @public
	 * @return {scopes.svySearch.SimpleSearch}
	 *
	 * @this {SvyGridFilters}
	 *  */
	SvyGridFilters.prototype.getDefaultSearch = function() {

		if (!this.getTable()) {
			return null;
		}
		
		
		
		var columns = this.getTable().columns;
		var tableFoundset = this.getTable().myFoundset.foundset;
		var tableDataSource;		
		
		var jsForm = solutionModel.getForm(this.getTable().getFormName());
		var jsTable = jsForm.findWebComponent(this.getTable().getName());
		var foundsetSelector = jsTable.getJSONProperty("myFoundset").foundsetSelector;
		
		try {
			if (foundsetSelector) {
				if (databaseManager.getTable(foundsetSelector)) {
					tableDataSource = foundsetSelector;
				} else if (foundsetSelector.split('.').length > 1) {
					tableDataSource = scopes.svyDataUtils.getRelationForeignDataSource(foundsetSelector)
				} else if (solutionModel.getRelation(foundsetSelector)) {
					var jsRel = solutionModel.getRelation(foundsetSelector);
					tableDataSource = jsRel.foreignDataSource;
				}
			}
		} catch (e) {
			application.output(e, LOGGINGLEVEL.ERROR);
		}
		
		if (tableDataSource) {
			// do nothing
		} else if (tableFoundset) {
			tableDataSource = tableFoundset.getDataSource();
		} else {
			var form = forms[this.formName];
			tableDataSource = form ? form.foundset.getDataSource() : null;
		}

		if (!tableDataSource) {
			return null;
		}

		// create a simple search
		var simpleSearch = scopes.svySearch.createSimpleSearch(tableDataSource);
		simpleSearch.setSearchText(this.searchText);
		simpleSearch.setDateFormat("dd-MM-yyyy");

		for (var i = 0; tableDataSource && columns && i < columns.length; i++) {
			var column = columns[i];

			if (column.dataprovider) {
				
				// default behavior search only on visible columns.
				
				// TODO should use the column.visible property or the columnState visible ?
				if (!column.visible) {
					continue;
				}
				
				// TODO use state of columns to determine non visible columns
				// check the state of non visible columns stored by the user
				if (false && !getConfigUseNonVisibleColumns()) {
					
					// TODO non visible columns should be updated at every search ?
				
					// scan only visible columns. Access the column state
					var jsonState = this.getTable().getColumnState();
					if (jsonState) {
						/** @type {{columnState:Array}} */
						var state = JSON.parse(jsonState);
						/** @type {Array} */
						var colsState = state.columnState ? state.columnState : [];
						for (var j = 0; j < colsState.length; j++) {
							if (colsState[j].hide) { // skip column if hidden
								continue;
							}
						}
					}
				}
				
				
				// Check if column exists
				var relationName = scopes.svyDataUtils.getDataProviderRelationName(column.dataprovider)
				var dataSource = relationName ? scopes.svyDataUtils.getRelationForeignDataSource(relationName) : tableDataSource;

				var table = databaseManager.getTable(dataSource);
				var col = table.getColumn(scopes.svyDataUtils.getUnrelatedDataProviderID(column.dataprovider));
				if (col) {
					var vlItems = null;
					
					// skip media fields
					if (col.getType() === JSColumn.MEDIA) {
						continue;
					}

					// check if valuelist substitions can be applied
					if (column.valuelist) {
						vlItems = application.getValueListItems(column.valuelist);
						if (!vlItems.getMaxRowIndex()) {
							application.output("skip search on column with valuelist " + column.valuelist);
							continue;
						}
					}

					// create the search provider
					// TODO shall i remove all white spaces !?
					var provider = simpleSearch.addSearchProvider(column.dataprovider);

					// set the provider alias
					var alias = column.headerTitle ? getI18nText(column.headerTitle) : column.dataprovider;
					provider.setAlias(alias);

					// if is a date use explicit search
					if (col.getType() === JSColumn.DATETIME) {
						provider.setImpliedSearch(false);
					}

					// add valuelist substitutions
					for (var index = 1; vlItems && index <= vlItems.getMaxRowIndex(); index++) {
						var vlItem = vlItems.getRowAsArray(index);
						provider.addSubstitution(vlItem[0], vlItem[1])

					}
				}
			}
		}
		return simpleSearch;
	}
	
	/**
	 * @public 
	 *
	 * @this {SvyGridFilters}
	 *  */
	SvyGridFilters.prototype.search = function() {
		var searchTextChanged = this.searchText !== this.simpleSearch.getSearchText() ? true : false;
		var foundset = this.getFoundSet();

		// quick search
		var searchQuery = this.getQuery();

		if (this.onSearchCommand) {
			//fire onSearchCommand
			this.onSearchCommand.call(this, searchQuery, foundset);
		} else if (searchTextChanged || this.searchText) {
			//apply search if relevant
			foundset.loadRecords(searchQuery);
		}
	}
}

/**
 * @constructor
 * @private
 * @properties={typeid:24,uuid:"E8CB92CC-FCCF-4A46-B180-9CF800899C2E"}
 * @AllowToRunInFind
 */
function initAbstractToolbarFilterUX() {
	AbstractToolbarFilterUX.prototype = Object.create(AbstractToolbarFilterUX.prototype);
	AbstractToolbarFilterUX.prototype.constructor = AbstractToolbarFilterUX;
	
	/**
	 * @protected 
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.applyFilters = function() {
		this.svyGridFilters.applyFilters(true);
		this.svyGridFilters.getFoundSet().loadAllRecords();
	}
	
	/**
	 * @public 
	 * Sets whether filters are automatically applied each time they were changed (defaults to true)
	 * When set to false, filters can be applied via applyFilters() of this ToolbarFilter
	 * @param {Boolean} autoApply
	 * @return {AbstractToolbarFilterUX}
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.setAutoApplyFilters = function(autoApply) {
		this.svyGridFilters.autoApply = autoApply;
		return this;
	}

	/**
	 * Returns the element used to display the filters
	 * @public
	 * @return {RuntimeComponent}
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.getElement = function() {
		return this.element;
	}
	
	/**
	 * Allows to provide a method that will be called when the filter for a specific column is created<br>
	 * That method then can create and return any filter that will then be used for this column
	 * 
	 * @public
	 * @param {function(CustomType<aggrid-groupingtable.column>): scopes.svyPopupFilter.AbstractPopupFilter} callback function that receives an aggrid-groupingtable Column as argument and must return a scopes.svyPopupFilter.AbstractPopupFilter
	 * @return {AbstractToolbarFilterUX}
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.setOnFilterCreate = function(callback) {
		this.onFilterCreate = scopes.svySystem.convertServoyMethodToQualifiedName(callback);
		return this;
	}	
	
	/**
	 * @protected 
	 * @param {function({values:Array, operator:String, filter:scopes.svyPopupFilter.AbstractPopupFilter})} callback
	 * 
	 * @return {AbstractToolbarFilterUX}
	 * 
	 * @deprecated use setOnFilterApplyCallback
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.setOnFilterApplyEvent = function(callback) {
		this.onFilterApplyEvent = scopes.svySystem.convertServoyMethodToQualifiedName(callback);
		return this;
	}
	
	/**
	 * Sets a callback method that is fired whenever the filter is applied<br>
	 * The callback method receives an array of values, the operator and the filter as arguments
	 * 
	 * @param {function(Array, String, scopes.svyPopupFilter.AbstractPopupFilter)} callback
	 * 
	 * @return {AbstractToolbarFilterUX}
	 *
	 * @public
	 * 
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.setOnFilterApplyCallback = function(callback) {
		this.onFilterApplyEvent = scopes.svySystem.convertServoyMethodToQualifiedName(callback);
		return this;
	}	
	
	/**
	 * Sets a callback method that is fired whenever a filter has been added
	 * 
	 * @param {function()} callback
	 * 
	 * @return {AbstractToolbarFilterUX}
	 * 
	 * @public
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.setOnFilterAddedCallback = function(callback) {
		this.onFilterAddedEvent = scopes.svySystem.convertServoyMethodToQualifiedName(callback);
		return this;
	}	
	
	/**
	 * 
	 * @param {function()} callback
	 * 
	 * @return {AbstractToolbarFilterUX}
	 * 
	 * @deprecated use setOnFilterRemovedCallback
	 * 
	 * @protected
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.setOnFilterRemovedEvent = function(callback) {
		this.onFilterRemovedEvent = scopes.svySystem.convertServoyMethodToQualifiedName(callback);
		return this;
	}	
	
	/**
	 * Sets a callback method that is fired whenever a filter is removed
	 * 
	 * @param {function()} callback
	 * 
	 * @return {AbstractToolbarFilterUX}
	 *
	 * @public
	 * 
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.setOnFilterRemovedCallback = function(callback) {
		this.onFilterRemovedEvent = scopes.svySystem.convertServoyMethodToQualifiedName(callback);
		return this;
	}
	
	/**
	 * Set the onSearchCommand function to override the search behavior.
	 * You can add custom conditions to the filter query object;
	 * 
	 * @public
	 * @param {function(QBSelect, JSFoundSet)} callback
	 * @return {AbstractToolbarFilterUX}
	 *
	 * @this {AbstractToolbarFilterUX}
	 * @example <pre>function onSearch(query, fs) {
	 *   // add custom conditions to the query
	 *   query.where.add(query.columns.orderdate.not.isNull);
	 *   
	 *   // apply the query to the foundset
	 *   fs.loadRecords(query);
	 * }
	 * </pre>
	 * 
	 *  */
	AbstractToolbarFilterUX.prototype.setOnSearchCommand = function(callback) {
		this.svyGridFilters.setOnSearchCommand(callback);
		return this;
	}
	
	/**
	 * Adds a filter for the given column
	 * 
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * 
	 * @return {Boolean}
	 * 
	 * @public 
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.addGridFilter = function(column) {
		throw scopes.svyExceptions.AbstractMethodInvocationException("addGridFilter not implemented")
	}
	
	/**
	 * Removes the filter for the given column
	 * 
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * 
	 * @return {Boolean}
	 * 
	 * @public 
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.removeGridFilter = function(column) {
		throw scopes.svyExceptions.AbstractMethodInvocationException("removeGridFilter not implemented")
	}
	
	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * 
	 * @return {Boolean}
	 * 
	 * @protected
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.showGridFilter = function(column) {
		throw scopes.svyExceptions.AbstractMethodInvocationException("showGridFilter not implemented")
	}
	
	/**
	 * Clears all grid filters
	 * 
	 * @return {Boolean}
	 * 
	 * @public
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.clearGridFilters = function() {

		// this.svyGridFilters.clearGridFilters();
		this._clearGridFilters()
			
		// on filter removed event
		if (this.onFilterRemovedEvent) {
			scopes.svySystem.callMethod(this.onFilterRemovedEvent);
		}
		return true;
	}
	
	/**
	 * Clears all grid filters
	 * Internal implementation, will take care to clear the filters and update the UI
	 * Will not trigger the event onFilterRemovedEvent
	 * 
	 * @return {Boolean}
	 * 
	 * @protected 
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype._clearGridFilters = function() {
		throw scopes.svyExceptions.AbstractMethodInvocationException("_clearGridFilters not implemented")
	}
	
	/**
	 *  
	 * Override this method in a subclass to adjust the UI to the updated values for the given dataprovider
	 * 
	 * @param {String} dataprovider
	 * @param {Array} values
	 * 
	 * @return {Boolean}
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.updateGridFilter = function(dataprovider, values) {
		throw scopes.svyExceptions.AbstractMethodInvocationException("updateGridFilter not implemented")
	}
	
	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * 
	 * @return {Boolean}
	 * 
	 * @protected
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.hasActiveFilter = function(column) {
		throw scopes.svyExceptions.AbstractMethodInvocationException("hasActiveFilter not implemented")
	}
	
	/**
	 * Returns true if the table has any column it can filter on
	 *
	 * @return {Boolean}
	 *
	 * @public
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.hasFilters = function() {
		return this.svyGridFilters.getFilters().length > 0 ? true : false;
	}
	
	/**
	 * Returns the filters' state of the toolbar
	 * 
	 * @return {Array<{
				id: String,
				dataprovider: String,
				operator: String,
				params: Object,
				text: String,
				values: Array}>} jsonState
				
	 * @public 
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.getToolbarFiltersState = function() {
		return this.svyGridFilters.getGridFiltersState();
	}
	
	/**
	 * Restores the filters' state 
	 * 
	 * @param {Array<{
				id: String,
				dataprovider: String,
				operator: String,
				params: Object,
				text: String,
				values: Array}>} jsonState
	 *
	 * @public 
	 * 
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.restoreToolbarFiltersState = function(jsonState) {

		// clear previous filters
		this._clearGridFilters();

		// restore new filters
		for (var i = 0; i < jsonState.length; i++) {
			var obj = jsonState[i];
			var column = this.getColumn(obj.dataprovider);

			if (!column) continue; // TODO throw a warning ?

			switch (column.filterType) {

			case 'NUMBER':
				obj.values = obj.values.map(function(value) {
					return utils.stringToNumber(value);
				});

				break;
			case 'DATE':
				obj.values = obj.values.map(function(value) {
					return new Date(value);
				});

				break;
			case 'TEXT':

			default:
				break;
			}

			var values = obj.values;
			
			// set the filter again
			this.setFilterValue(column, values, obj.operator);
			var filter = this.getOrCreateToolbarFilter(column);
			filter.restoreState(obj);
		}
		
		// update filter UI
		var element = this.getElement();
		if (this.hasFilters()) {
			element.addStyleClass('has-filter');
		} else {
			element.removeStyleClass('has-filter');
		}
	}
	
	/**
	 * Applies all filters and returns the query for this toolbar
	 *
	 * @return {QBSelect}
	 *
	 * @public
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.getQuery = function() {
		return this.svyGridFilters.getQuery();
	}

	/**
	 * Sets the search text for the simple search
	 * 
	 * @return {AbstractToolbarFilterUX}
	 * 
	 * @public
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.setSearchText = function(searchText) {
		this.svyGridFilters.setSearchText(searchText);
		return this;
	}
	
	/**
	 * Returns the search text for the simple search
	 *
	 * @return {String}
	 *
	 * @public
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.getSearchText = function() {
		return this.svyGridFilters.getSearchText();
	}	
	
	/**
	 * Returns the SimpleSearch
	 *
	 * @return {scopes.svySearch.SimpleSearch}
	 *
	 * @public
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.getSimpleSearch = function() {
		return this.svyGridFilters.getSimpleSearch();
	}
	
	/**
	 * Returns the SearchProvider for the given column
	 *
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 *
	 * @return {scopes.svySearch.SearchProvider}
	 *
	 * @public
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.getSearchProvider = function(column) {
		return this.svyGridFilters.getSearchProvider(column);
	}
	
	/**
	 * Returns the table column for the given dataprovider
	 * 
	 * @param {String} dataprovider
	 * 
	 * @return {CustomType<aggrid-groupingtable.column>}
	 * 
	 * @protected  
	 *
	 * @this {AbstractToolbarFilterUX}
	 *  */
	AbstractToolbarFilterUX.prototype.getColumn = function (dataprovider) {
		return this.svyGridFilters.getColumn(dataprovider);
	}
	
	/**
	 * Applies all filters and executes the search
	 * 
	 * @param {String} [searchText] optional searchText to search for; if not provided here, call setSearchText() to set the search criteria before performing the search
	 * 
	 * @public  
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.search = function(searchText) {
		if (arguments.length === 1) {
			this.svyGridFilters.setSearchText(searchText);
		}
		this.svyGridFilters.applyFilters(true);
		return this.svyGridFilters.search();
	}
	
	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * @param {JSEvent} event
	 * 
	 * @this {AbstractToolbarFilterUX}
	 * 
	 * @protected 
	 *
	 * @properties={typeid:24,uuid:"06EB08B6-AA6C-4DC8-A0A7-B7CF3C140D77"}
	 */
	AbstractToolbarFilterUX.prototype.showPopupFilter = function (column, event) {
		var filter = this.getOrCreateToolbarFilter(column);

		// show the filter
		var popup = filter.createPopUp(this.onFilterApply);
		popup.x(event.getX());
		popup.y(event.getY());
		// popup.width(300);
		popup.show();
	}
	
	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * 
	 * @protected 
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.getFilter = function(column) {
		/** @type {scopes.svyPopupFilter.AbstractPopupFilter}  */
		var filter = this.svyGridFilters.getGridFilter(column);
		return filter;
	}
	
	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * 
	 * @protected 
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.getOrCreateToolbarFilter = function(column) {
		/** @type {scopes.svyPopupFilter.AbstractPopupFilter}  */
		var filter = this.getFilter(column);
		
		if (!filter && this.onFilterCreate) {
			filter = scopes.svySystem.callMethod(this.onFilterCreate, [column]);
			if (filter) {
				// include this as param
				filter.addParam(this);
				// set filter's dataprovider
				filter.setDataProvider(column.dataprovider);
				// persist the filter in memory
				this.svyGridFilters.addGridFilter(column, filter);
			}
		}
		
		if (!filter) {
			var popupTemplates = getPopupRendererForms();
			
			var filterType;
			if (column.valuelist) {
				filterType = FILTER_TYPES.SELECT;
				
				// will be a lookup form
				// number picker
				// calendar picker
				var lookup = scopes.svyLookup.createValueListLookup(column.valuelist);
				/** @type {RuntimeForm<AbstractLookup>} */
				var lookupForm = popupTemplates.getRendererForm(FILTER_TYPES.SELECT);
				lookup.setLookupForm(lookupForm);
				filter = scopes.svyPopupFilter.createSelectFilter(column.dataprovider, lookup);
			} else {
				// will be a free text entry
				switch (column.filterType) {
				case 'TEXT':
					filterType = FILTER_TYPES.TOKEN;
					filter = scopes.svyPopupFilter.createTokenFilter();
					filter.setRendererForm(popupTemplates.getRendererForm(FILTER_TYPES.TOKEN));
					break;
				case 'NUMBER':
					// number picker
					filterType = FILTER_TYPES.NUMBER;
					filter = scopes.svyPopupFilter.createNumberFilter();
					filter.setRendererForm(popupTemplates.getRendererForm(FILTER_TYPES.NUMBER));
					break;
				case 'DATE':
					// calendar picker
					filterType = FILTER_TYPES.DATE;
					filter = scopes.svyPopupFilter.createDateFilter();
					filter.setRendererForm(popupTemplates.getRendererForm(FILTER_TYPES.DATE));
					break;
				default:
					break;
				}
			}

			if (filter) {
				// set filter's dataprovider
				filter.setDataProvider(column.dataprovider);
				filter.setText(getI18nText(column.headerTitle));
				
				// set default operator
				var operator = popupTemplates.getDefaultOperator(filterType);
				if (operator) {
					filter.setOperator(operator);
				}
				
				// include this as param
				filter.addParam(this);

				// persist the filter in memory
				this.svyGridFilters.addGridFilter(column, filter);
			}
		}
		return filter;
	}
	
	/**
	 * Shows the filter picker popup
	 * 
	 * @param {RuntimeComponent} target
	 * 
	 * @public
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.showPopupFilterPicker = function(target) {

		var filterPopupMenu = plugins.window.createPopupMenu();
		var menuItem = filterPopupMenu.addMenuItem("title");
		menuItem.enabled = false;
		menuItem.text = "Add filter";

		var columnFilters = this.svyGridFilters.getFilters();
		for (var index = 0; index < columnFilters.length; index++) {
			var columnFilter = columnFilters[index];
			var check = filterPopupMenu.addCheckBox(columnFilter.dataprovider);
			check.selected = this.hasActiveFilter(this.getColumn(columnFilter.dataprovider));
			check.text = columnFilter.text;
			check.methodArguments = [columnFilter.columnIndex, columnFilter.id, columnFilter.dataprovider]
			check.setMethod(onFilterPopupMenuClicked);
		}

		filterPopupMenu.cssClass = "toolbar-filter-popup";

		// cache the latest menu so it can be used in callback
		latestToolbarFilter = this;
		
		filterPopupMenu.show(target);
	}

	/**
	 * Sets a filter value for the given column
	 * 
     * @param {CustomType<aggrid-groupingtable.column>} column
     * @param {Array} values
     * @param {String} operator
     * 
     * @public  
     *
     * @this {AbstractToolbarFilterUX}
     */
	AbstractToolbarFilterUX.prototype.setFilterValue = function(column, values, operator) {
		if (!this.hasActiveFilter(column)) {
			this.addGridFilter(column);
		}
		var filter = this.getOrCreateToolbarFilter(column);
		filter.setValues(values);
		filter.setOperator(operator);
		this.onFilterApply(values, operator, filter, true);
	}
    
	/**
	 * @param {Array} values
	 * @param {String} operator
	 * @param {scopes.svyPopupFilter.AbstractPopupFilter} filter
	 * @param {Boolean} [forceApply] Default false.
	 * 
	 * @protected 
	 *
	 * @this {AbstractToolbarFilterUX}
	 */
	AbstractToolbarFilterUX.prototype.onFilterApply = function (values, operator, filter, forceApply) {

		/** @type {AbstractToolbarFilterUX} */
		var thisIntance = filter.getParams()[0];
		
		/** @type {SvyGridFilters} */
		var gridFilters = thisIntance['svyGridFilters'];
		

		// check if values or operator have changed
		var currentValues = filter.getValues();
		var currentOperator = filter.getOperator();
		if (!forceApply && scopes.svyJSUtils.areObjectsEqual(currentValues, values) && operator == currentOperator) {
			// nothing has changed, do nothing
			return;
		}
		
		//	TODO to be moved somewhere else ~?
		// persist the values & operator:
		filter.setOperator(operator);
		filter.setValues(values);
		
		var displayValues = values ? values : [];

		// resolve valuelist real values
		var column = gridFilters.getColumn(filter.getDataProvider());
		if (column.valuelist) {
			displayValues = [];
			for (var i = 0; i < values.length; i++) {
				displayValues[i] = application.getValueListDisplayValue(column.valuelist, values[i]);
			}
		}

		// format dates
		displayValues = displayValues.map(function(v) {
			if (v instanceof Date) {
				return utils.dateFormat(v, globalFilterConfig.globalDateDisplayFormat);
			} else {
				return v;
			}
		});
		
		// update the UI
		thisIntance.updateGridFilter(filter.getDataProvider(), displayValues);
		
		// apply the search
		gridFilters.search();
		
		// if has active filters
		var element = thisIntance.getElement();
		if (gridFilters.getActiveFilters().length) {
			element.addStyleClass('has-active-filter');
		} else {
			element.removeStyleClass('has-active-filter');
		}
	
		if (thisIntance['onFilterApplyEvent']) {
			/** @type {String} */
			var onFilterApplyEvent = thisIntance['onFilterApplyEvent'];
			scopes.svySystem.callMethod(onFilterApplyEvent, [values, operator, filter])
		}
	}
}

/**
* @private 
* @param {Number} itemIndex
* @param {Number} parentIndex
* @param {Boolean} isSelected
* @param {String} parentText
* @param {String} menuText
* @param {Number} columnIndex the column index
* @param {String} [columnId] the id of the column
* @param {String} [columnDataprovider] dataprovider bound to the column
*
* @properties={typeid:24,uuid:"4288095A-3F08-48FD-AD10-C86B79972DA9"}
*/
function onFilterPopupMenuClicked(itemIndex, parentIndex, isSelected, parentText, menuText, columnIndex, columnId, columnDataprovider) {
	var toolbarFilterUX = latestToolbarFilter;
	latestToolbarFilter = null;
	if (toolbarFilterUX) {
		/** @type {SvyGridFilters} */
		var gridFilters = toolbarFilterUX['svyGridFilters'];
		var selectedColumn = gridFilters.getTable().getColumn(columnIndex);
		if (isSelected) {
			toolbarFilterUX.removeGridFilter(selectedColumn);
		} else {
			toolbarFilterUX.addGridFilter(selectedColumn);
		}
	}
}

/**
 * @constructor
 * @extends {AbstractToolbarFilterUX}
 * @private
 * @properties={typeid:24,uuid:"C7D04E91-D3C9-42D0-8837-7F1AFE0FF731"}
 */
function initListComponentFilterRenderer() {
	ListComponentFilterRenderer.prototype = Object.create(AbstractToolbarFilterUX.prototype);
	ListComponentFilterRenderer.prototype.constructor = ListComponentFilterRenderer;

	/**
	 * Returns the Custom List element this renderer is using to display the filters
	 * 
	 * @return {RuntimeWebComponent<customrenderedcomponents-customlist>|RuntimeWebComponent<customrenderedcomponents-customlist_abs>}
	 * 
	 * @public
	 * 
	 * @override
	 *
	 * @this {ListComponentFilterRenderer}
	 */
	ListComponentFilterRenderer.prototype.getElement = function() {
		return this.element;
	}

	/**
	 * @return {String}
	 * 
	 * @protected
	 *
	 * @this {ListComponentFilterRenderer}
	 */
	ListComponentFilterRenderer.prototype.getRenderTemplate = function() {
		return "(function renderFilterEntry(entry) {  \n\
			var template = '';\n\
			var strDivider = ' : ';\n\
			template += '<div class=\"btn-group push-right margin-left-10 toolbar-filter-tag\">' + \n\
			'<button class=\"btn btn-default btn-sm btn-round\" data-target=\"open\" svy-tooltip=\"entry.text + strDivider + entry.value\">' + \n\
				'<span class=\"toolbar-filter-tag-text\">' + entry.text + '</span>' + \n\
				'<span class=\"toolbar-filter-tag-value\"> ' + entry.value.split(',').join(', ') + ' </span>' + \n\
				'<span class=\"toolbar-filter-tag-icon fas fa-angle-down\">' + '</span>' + \n\
			'</button>' + \n\
			'<button class=\"btn btn-default btn-sm btn-round\" data-target=\"close\">' + \n\
			'<span class=\"fas fa-times text-danger\">' + '</span>' + '</button>' + '</div>'; \n\
			return template; \n\
		})";
	}
	
	
	/**
	 * Called when the mouse is clicked on a list entry.
	 *
	 * @param {object} entry
	 * @return {String}
	 * @protected
	 * @this {ListComponentFilterRenderer}
	 *  */
	ListComponentFilterRenderer.prototype.getDataProvider = function(entry) {
		return entry['dataprovider'];
	}
	
	/**
	 * Called when the mouse is clicked on a list entry.
	 *
	 * @param {object} entry
	 * @param {Number} index
	 * @param {string} dataTarget
	 * @param {JSEvent} event
	 *  
	 * @public
	 * @this {ListComponentFilterRenderer}
	 *  */
	ListComponentFilterRenderer.prototype.onClick = function(entry, index, dataTarget, event) {
		var column = this.svyGridFilters.getColumn(this.getDataProvider(entry));

		if (!dataTarget || dataTarget == "open") {
			//open the filter
			if (column) {
				this.showPopupFilter(column, event);
			}
		} else if (dataTarget == "close") {
			// remove the filter
			if (column) {
				this.removeGridFilter(column);
			} else {
				this.getElement().removeEntry(index)
			}
		}
	}

	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * 
	 * @protected
	 *
	 * @this {ListComponentFilterRenderer}
	 */
	ListComponentFilterRenderer.prototype.addGridFilter = function(column) {
		var newFilter = this.getElement().newEntry();
		newFilter.text = getI18nText(column.headerTitle);
		newFilter.dataprovider = column.dataprovider;
		newFilter.value = "";
		
		// if has active filters
		var element = this.getElement();
		element.addStyleClass('has-filter');
		
		if (this.onFilterAddedEvent) {
			scopes.svySystem.callMethod(this.onFilterAddedEvent)
		}
	}

	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * 
	 * @protected
	 *
	 * @this {ListComponentFilterRenderer}
	 */
	ListComponentFilterRenderer.prototype.removeGridFilter = function(column) {
		var index = this.getFilterTagIndex(column);
		if (index > -1) {
			this.getElement().removeEntry(index);
		}
		this.svyGridFilters.removeGridFilter(column);
			
		// on filter removed event
		if (this.onFilterRemovedEvent) {
			scopes.svySystem.callMethod(this.onFilterRemovedEvent);
		}
			
	}

	/**
	 * @param {String} dataprovider
	 * @param {Array} displayValues
	 *
	 * @protected
	 * 
	 * @this {ListComponentFilterRenderer}
	 */
	ListComponentFilterRenderer.prototype.updateGridFilter = function(dataprovider, displayValues) {
		var index;
		var element = this.getElement();
		var count = element.getEntriesCount();
		var entries = [];
		for (var i = 0; i < count; i++) {
			var filterTag = element.getEntry(i);
			// TODO can i rely on dataprovider only !?
			if (filterTag && filterTag.dataprovider == dataprovider) {
				index = i;
			}
			entries.push(filterTag);
		}

		if (index || index == 0) {

			// TODO can i make an API in listcomponent to update an entry value !?
			// clear and re-draw all elements
			element.clear();
			for (i = 0; i < entries.length; i++) {
				var entryCopy = entries[i];
				var entry = element.newEntry();
				
				// copy entry properties
				for (var prop in entryCopy) {
					entry[prop] = entryCopy[prop];
				}

				// update display value if necessary
				if (i === index) {
					entry.value = displayValues.join(",");
				}

			}
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Clears all grid filters
	 * 
	 * @protected 
	 * 
	 * @override 
	 *
	 * @this {ListComponentFilterRenderer}
	 */
	ListComponentFilterRenderer.prototype._clearGridFilters = function() {
		this.getElement().clear();
		this.svyGridFilters.clearGridFilters();
		
		// if has no filters
		var element = this.getElement();
		element.removeStyleClass('has-filter');
	}

	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 * 
	 * @return {Boolean}
	 * 
	 * @protected
	 *
	 * @this {ListComponentFilterRenderer}
	 */
	ListComponentFilterRenderer.prototype.hasActiveFilter = function(column) {
		return this.getFilterTagIndex(column) > -1 ? true : false;
	}

	/**
	 * @param {CustomType<aggrid-groupingtable.column>} column
	 *
	 * @return {Number}
	 * 
	 * @protected 
	 *
	 * @this {ListComponentFilterRenderer}
	 */
	ListComponentFilterRenderer.prototype.getFilterTagIndex = function(column) {
		var count = this.getElement().getEntriesCount();
		for (var i = 0; i < count; i++) {
			var filterTag = this.getElement().getEntry(i);
			// TODO can i rely on dataprovider only !?
			if (filterTag && filterTag.dataprovider == column.dataprovider) {
				return i;
			}
		}
		return -1;
	}

}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"FE4768E2-C48C-4BBE-B6B1-30CCC1194975",variableType:-4}
 */
var init = (function() {
	initPopupRendererForms();
	globalFilterConfig = new FilterConfig();
	popupRendererForms = new PopupRendererForms();
	initSvyGridFilters();
	initAbstractToolbarFilterUX();
	initListComponentFilterRenderer();
}());
