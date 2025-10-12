using System.Linq.Expressions;
using MongoDB.Driver;
using TriMelERM_backend.Models;

using System.Linq.Expressions;
using MongoDB.Bson;
using MongoDB.Driver;

namespace TriMelERM_backend.Models;

public interface IRepository<T>
{
    Task<IEnumerable<T>> GetAllAsync(ProjectionDefinition<T>? project = null, int limit = 100);
    Task<T?> GetByIdAsync(string id);
    Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter, ProjectionDefinition<T>? projection = null, int limit = 100);
    Task<T> CreateAsync(T entity);
    Task UpdateAsync(string id, T entity);
    Task<DeleteResult> DeleteAsync(string id);
    Task UpdateFieldsAsync(string id, UpdateDefinition<T> update);
    Task<T?> FindOneAsync(FilterDefinition<T> filter);
    Task<IEnumerable<T>> FindManyAsync(FilterDefinition<T> filter, int limit = 100);
    Task<IEnumerable<T>> FindManyAsync(Expression<Func<T, bool>> predicate, int limit = 100);
    Task<bool> ExistsAsync(FilterDefinition<T> filter);
    Task<long> CountAsync(FilterDefinition<T>? filter = null);
    Task<long> DeleteManyAsync(FilterDefinition<T> filter);
    Task<long> UpdateManyAsync(FilterDefinition<T> filter, UpdateDefinition<T> update);

}

public class DatabaseSettings
{
    public string ConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    public string CollectionName { get; set; } = null!;
}



public class MongoRepository<T> : IRepository<T>
    {
        FilterDefinitionBuilder<T> _filterBuilder;
        public readonly IMongoCollection<T> Collection;

        /// <summary>
        /// Initializes a new instance of the MongoRepository class.
        /// </summary>
        /// <param name="database">MongoDB database instance.</param>
        /// <param name="collectionName">Name of the collection.</param>
        public MongoRepository(IMongoDatabase database, string collectionName)
        {
            Collection = database.GetCollection<T>(collectionName);
            _filterBuilder = new FilterDefinitionBuilder<T>();
        }

        /// <summary>
        /// Retrieves all documents from the collection.
        /// </summary>
        /// <returns>A list of entities.</returns>
        public async Task<IEnumerable<T>> GetAllAsync(ProjectionDefinition<T>? project = null, int limit = 100)
        {
            var query = Collection.Find(_ => true).Limit(limit);
            if (project != null)
                query = query.Project<T>(project);
            return await query.ToListAsync();
        }

        /// <summary>
        /// Retrieves a document by its unique identifier.
        /// </summary>
        /// <param name="id">Unique identifier of the document.</param>
        /// <returns>The entity corresponding to the provided identifier, or null if not found.</returns>
        public async Task<T?> GetByIdAsync(string id)
        {
            var objectId = MongoDB.Bson.ObjectId.Parse(id);
            var filter = Builders<T>.Filter.Eq("_id", objectId);
            return await Collection.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Retrieves documents from the collection based on a filter.
        /// </summary>
        /// <param name="filter">Filter definition to apply.</param>
        /// <param name="projection"></param>
        /// <param name="limit"></param>
        /// <returns>A list of entities matching the filter.</returns>
        public async Task<IEnumerable<T>> GetAllAsync(FilterDefinition<T> filter, ProjectionDefinition<T>? projection = null, int limit = 100)
        {
            var query = Collection.Find(filter).Limit(limit);
            if (projection != null)
                query = query.Project<T>(projection);
            return await query.ToListAsync();
        }

        /// <summary>
        /// Creates a new document in the collection.
        /// </summary>
        /// <param name="entity">Entity to be created.</param>
        /// <returns>The created entity.</returns>
        public async Task<T> CreateAsync(T entity)
        {
            await Collection.InsertOneAsync(entity);
            return entity;
        }

        /// <summary>
        /// Updates an existing document in the collection.
        /// </summary>
        /// <param name="id">Unique identifier of the document to update.</param>
        /// <param name="entity">Updated entity.</param>
        public async Task UpdateAsync(string id, T entity)
        {
            var objectId = MongoDB.Bson.ObjectId.Parse(id);
            var filter = Builders<T>.Filter.Eq("_id", objectId);
            await Collection.ReplaceOneAsync(filter, entity);
        }

        /// <summary>
        /// Deletes a document from the collection.
        /// </summary>
        /// <param name="id">Unique identifier of the document to delete.</param>
        public async Task<DeleteResult> DeleteAsync(string id)
        {
            ObjectId objectid = ObjectId.Parse(id);
            var filter = Builders<T>.Filter.Eq("_id", objectid);
            var response = await Collection.DeleteOneAsync(filter);
            return response;
        }      
        
        public async Task UpdateFieldsAsync(string id, UpdateDefinition<T> update)
        {
            var filter = Builders<T>.Filter.Eq("_id", id);
            await Collection.UpdateOneAsync(filter, update);
        }
        public async Task<UpdateResult> UpsertAsync(FilterDefinition<T> filter, UpdateDefinition<T> update, UpdateOptions options)
        {
            return await Collection.UpdateOneAsync(filter, update, options);
        }
        /// <summary>
        /// Finds one entity by filter.
        /// </summary>
        public async Task<T?> FindOneAsync(FilterDefinition<T> filter)
        {
            return await Collection.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Finds multiple entities by filter.
        /// </summary>
        public async Task<IEnumerable<T>> FindManyAsync(FilterDefinition<T> filter, int limit = 100)
        {
            return await Collection.Find(filter).Limit(limit).ToListAsync();
        }

        /// <summary>
        /// Finds multiple entities using LINQ expression (strongly typed).
        /// </summary>
        public async Task<IEnumerable<T>> FindManyAsync(Expression<Func<T, bool>> predicate, int limit = 100)
        {
            return await Collection.Find(predicate).Limit(limit).ToListAsync();
        }

        /// <summary>
        /// Checks if an entity exists by filter.
        /// </summary>
        public async Task<bool> ExistsAsync(FilterDefinition<T> filter)
        {
            return await Collection.Find(filter).AnyAsync();
        }

        /// <summary>
        /// Counts documents in a collection.
        /// </summary>
        public async Task<long> CountAsync(FilterDefinition<T>? filter = null)
        {
            filter ??= _filterBuilder.Empty;
            return await Collection.CountDocumentsAsync(filter);
        }

        /// <summary>
        /// Deletes multiple documents.
        /// </summary>
        public async Task<long> DeleteManyAsync(FilterDefinition<T> filter)
        {
            var result = await Collection.DeleteManyAsync(filter);
            return result.DeletedCount;
        }

        /// <summary>
        /// Updates multiple documents.
        /// </summary>
        public async Task<long> UpdateManyAsync(FilterDefinition<T> filter, UpdateDefinition<T> update)
        {
            var result = await Collection.UpdateManyAsync(filter, update);
            return result.ModifiedCount;
        }
        
        /// <summary>
        /// Paginates 
        /// </summary>
        public async Task<IEnumerable<T>> GetPagedAsync(
            FilterDefinition<T>? filter,
            SortDefinition<T>? sort,
            int pageNumber,
            int pageSize)
        {
            filter ??= Builders<T>.Filter.Empty;

            var query = Collection.Find(filter);

            if (sort != null)
                query = query.Sort(sort);

            return await query
                .Skip((pageNumber - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();
        }

    }