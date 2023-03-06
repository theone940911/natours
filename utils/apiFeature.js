class ApiFeature {
  constructor(query, queryParams) {
    this.query = query;
    this._queryParams = queryParams;
  }

  filter() {
    const queryObj = { ...this._queryParams };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this._queryParams.sort) {
      const sortBy = this._queryParams.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limit() {
    if (this._queryParams.fields) {
      const fields = this._queryParams.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const limit = this._queryParams.limit || 100;
    const page = this._queryParams.page || 1;
    const skip = (page - 1) * limit;
    // const countTours = await this._collection.countDocuments();
    const countTours = 11;
    if (skip >= countTours) throw new Error('This page does not exist!');
    else {
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}

export default ApiFeature;
