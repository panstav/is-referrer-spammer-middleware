const searchBlacklist = require('@panstav/is-referrer-spammer');

module.exports = isReferrerSpammerMiddleware;

function isReferrerSpammerMiddleware(handleFn){

	return (req, res, next) => {

		searchBlacklist(req.headers.referer)
			.then(handleOrContinue)
			.catch(next);

		function handleOrContinue(result){
			if (result === false) return next();

			handleFn(req, res, next);
		}

	};

}