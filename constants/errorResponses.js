const ERROR = Object.freeze({
    INTERNAL_ERROR: {
        statusCode: 500,
        status: {
            code: "SCH50",
            message: "Internal Error in the service",
            identifier: null,
            date: null
        }
    },
    BAD_REQUEST: {
        statusCode: 400,
        status: {
            code: "SCH42",
            message: "The request is bad",
            identifier: null,
            date: null
        }
    }
});

module.exports = ERROR;
