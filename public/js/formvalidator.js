/*
 *JQuery Plugin - Interface
 *@author Babu Suriyanarayanan
 */
// 
var myObject = {
    // plugin initialze 
    init: function(options, elem) {
        if (!options) {
            options = this.options;
        }
        if (!elem) {
            elem = this.elem;
        }
        this.options = $.extend({}, this.options, options);
        this.elem = elem;
        this.$elem = $(elem);
        this._build();
        return this;
    },
    // plugin settings
    options: {
        validateAttribute: "formvalidate",
        validationEventTrigger: "blur",
        focusFirstField: true,
        hideErrorOnChange: true,
        skipHiddenFields: true
    },
    // evaluate each element inside form
    _build: function() {
        var _this = this;
        $('input,textarea,select', this.$elem).each(function(index, e) {
            var _elements = $(this);
            var _element = _elements[0];
            if (!_this.isHidden($(_element))) {
                _this.onInvalid(_element);
                if (_this.options.hideErrorOnChange) {
                    _this.hideError(_element);
                }

            }
        });
        _this.onFocusFirstField();
    },
    // validate each element field against data attrbute
    fieldValidation: function(pTarget, pParentElem, pErrorElem) {
        var _this = this;
        if (pTarget.val() === "") {
            var msg = pTarget.data("errormessageValueMissing");
            this.showErroInfo(pErrorElem, msg);
            pTarget.addClass('field-invalid');

        } else {
            pParentElem.find('.label-invalid').remove('label');
            var dataType = pTarget.data(this.options.validateAttribute);
            if ("number" === dataType) {
                if (!$.isNumeric(pTarget.val())) {
                    pTarget.addClass('field-invalid');
                    var msg = "use numeric only";
                    this.showErroInfo(pErrorElem, msg);
                }
            } else if ("email" === dataType) {
                if (!this.validateEmailRule(pTarget)) {
                    pTarget.addClass('field-invalid');
                    var msg = "Please enter valid email";
                    this.showErroInfo(pErrorElem, msg);

                }
            } else if ("phone" === dataType) {
                var phInfoMsg = this.validatePhoneNumber(pTarget);

                if (phInfoMsg && phInfoMsg !== "true") {
                    pTarget.addClass('field-invalid');
                    this.showErroInfo(pErrorElem, phInfoMsg);
                }
            } else if ("password" === dataType) {
                var passwordInfoMsg = this.validatePassword(pTarget);
                if (passwordInfoMsg && passwordInfoMsg !== "true") {
                    pTarget.addClass('field-invalid');
                    this.showErroInfo(pErrorElem, passwordInfoMsg);
                }
            }
        }

    },
    // highlight first element in form field
    onFocusFirstField: function() {
        var firstElem = this.$elem.find('.step1 input').first()[0];
        var firstElemToValidate = $(firstElem);
        firstElem.focus();
        firstElemToValidate.addClass('field-invalid');
        var msg = "First Name is required";
        var errorElem = firstElemToValidate.parents('.row').find('.error-container')
        this.showErroInfo(errorElem, msg);

    },
    // attach handler on blur to each element
    onInvalid: function(pElement) {
        var _this = this;
        pElement.oninvalid = onInvalidHandler;
        $(pElement).blur(onInvalidHandler);

        function onInvalidHandler(e) {
            var _target = $(e.target),
                parentElem = _target.parents('.row'),
                _errorElem = parentElem.find('.error-container'),
                _targetId = _target.attr('id');
            _target.removeClass('field-invalid');
            _this.fieldValidation(_target, parentElem, _errorElem);

        }
    },
    // hide error on field input
    hideError: function(pElement) {

        pElement.oninput = function(e) {
            var rowElem = $(e.target).parents('.row');
            rowElem.removeClass('field-invalid');
            rowElem.find('.label-invalid').remove('label');
        };

    },
    isHidden: function(pElement) {
        var hiddenFlag = pElement.is(':hidden');
        if (this.options.skipHiddenFields && hiddenFlag) {
            return true;
        } else {
            return false;
        }

    },
    // attach error into DOM
    showErroInfo: function(pErrorElem, pMsg) {
        if (pErrorElem.length) {
            pErrorElem.html('<label class="label-invalid">' + pMsg + '</label>');
        } else {
            pParentElem.find('.label-invalid').remove('label');
            pErrorElem.append('<label class="label-invalid">' + pMsg + '</label>');
        }

    },
    validateRules: function(pElement) {
        //this.validateEmailRule(pElement);
    },
    validateEmailRule: function(pElement) {
        var emailTxt = pElement.val();
        var regexEmailPattern = /^([a-zA-Z0-9.+_-]*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        return regexEmailPattern.test(emailTxt);
    },
    validatePhoneNumber: function(pElement) {
        var digits = this.getRules('phone');
        if (!digits) {
            digits = 10;
        }
        pElement.val(pElement.val().replace(/\D/g, ''));
        var rtnVal = pElement.val();
        if (!rtnVal.match(/^\+?[\d\s]+$/))
            return "Phone number must be numeric and spaces only";
        if (rtnVal.match(/^\+/))
            return "true";
        if (!rtnVal.match(/^0/))
            return "start with 0";
        if (rtnVal.replace(/\s/g, "").length !== digits)
            return "Phone number must be " + digits + " digits long";
        return "true";
    },
    validatePassword: function(pElement) {
        var rtnVal = pElement.val();
        if (rtnVal.replace(/\s/g, "").length < 6)
            return "Password must be minimum 6 digits long";
        return "true";

    },
    addRules: function(pRulesObj) {
        this.rulesObj = pRulesObj;
    },
    getRules: function(pField) {
        var rules = this.rulesObj;
        var retVal;
        $.each(rules, function(key, values) {
            if (pField === values.field) {
                retVal = values.digits;
            }


        });
        return retVal;
    }

};

// Object.create support test, and fallback for browsers without it
if (typeof Object.create !== "function") {
    Object.create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

// Create a plugin based on a defined object
$.plugin = function(name, object) {
    $.fn[name] = function(options) {
        return this.each(function() {
            if (!$.data(this, name)) {
                $.data(this, name, Object.create(object).init(
                    options, this));
            }
        });
    };
};


$(function() {
    $.plugin('myobj', myObject);
    $('#rfpFormStep1').myobj({
        hideErrorOnChange: true,
        skipHiddenFields: true
    });
    var inst = $('#rfpFormStep1').data('myobj');
    var rulesObj = [{
        'field': 'phone',
        'digits': 10
    }]
    inst.addRules(rulesObj);
    $('.fld-submit').off("click").on("click", function() {
        var path = 'http://localhost:3000/data/resdata';
        var passVal = $('#rfpFormStep1 #Password').val();
        $.ajax({
            url: path,
            dataType: 'json',
            data: {
                password: passVal
            },
            success: function(data) {
                var isPwdvalid = data[0].validpassword;
                isPwdvalid = $.parseJSON(isPwdvalid);
                if (!isPwdvalid) {
                    $('.server-error').css({
                        "display": "block"
                    });
                } else {
                    $('.server-error').css({
                        "display": "none"
                    });
                }
            }

        });

        return false;
    });



});