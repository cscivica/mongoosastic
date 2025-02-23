"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unIndex = exports.index = void 0;
const tslib_1 = require("tslib");
const bulking_1 = require("./bulking");
const mapping_1 = (0, tslib_1.__importDefault)(require("./mapping"));
const utils_1 = require("./utils");
function index(inOpts = {}) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const options = this.esOptions();
        const client = this.esClient();
        const filter = options && options.filter;
        if (filter && filter(this)) {
            return this.unIndex();
        }
        const indexName = inOpts.index ? inOpts.index : (0, utils_1.getIndexName)(this);
        if (this.schema.mappings === undefined || this.schema.mappings === null) {
            const generator = new mapping_1.default();
            const mapping = generator.generateMapping(this.schema);
            this.schema.mappings = mapping;
        }
        let body;
        if (options.customSerialize) {
            body = options.customSerialize(this, this.schema.mappings);
        }
        else {
            body = (0, utils_1.serialize)(this, this.schema.mappings);
        }
        if (options.transform) {
            body = yield options.transform(body, this);
        }
        const opt = {
            index: indexName,
            id: this._id.toString(),
            body: body,
            bulk: options.bulk,
            refresh: options.forceIndexRefresh,
            routing: options.routing ? options.routing(this) : undefined,
        };
        const model = this.constructor;
        if (opt.bulk) {
            yield (0, bulking_1.bulkAdd)(Object.assign({ model }, opt));
            return this;
        }
        else {
            return client.index(opt);
        }
    });
}
exports.index = index;
function unIndex() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const options = this.esOptions();
        const client = this.esClient();
        const indexName = (0, utils_1.getIndexName)(this);
        const opt = {
            client: client,
            index: indexName,
            tries: 3,
            id: this._id.toString(),
            bulk: options.bulk,
            model: this.constructor,
            routing: options.routing ? options.routing(this) : undefined,
        };
        if (opt.bulk) {
            yield (0, bulking_1.bulkDelete)(opt);
        }
        else {
            yield (0, utils_1.deleteById)(this, opt);
        }
        return this;
    });
}
exports.unIndex = unIndex;
//# sourceMappingURL=methods.js.map