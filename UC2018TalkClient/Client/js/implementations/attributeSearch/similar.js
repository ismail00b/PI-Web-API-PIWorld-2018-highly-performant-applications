"use strict";

class SimilarAttributeSearch extends IAttributeSearch {
    async AttributeSearch(config, selectedAttribute) {
        // Construct the URI for the Batch controller.
        let uri = `${config.server}/batch`;

        // Create a Batch request - look at the other method for details.
        let postData = this.CreateBatchRequest(config, selectedAttribute);

        // Execute the request by POSTing it to the Batch controller.
        let results = await Post(uri, postData);

        // Return the results. If you look at this object in the debugger, it is a single JSON
        // object containing smaller JSON objects: each smaller JSON is the result of the
        // associated subrequest.
        return results;
    }

    CreateBatchRequest(config, selectedAttribute) {
        // This method creates the batch request's content. This will be attached as the body of
        // our request.

        // Create the URL to retrieve the specified attribute. This URL is the same as normal.
        let initialResource = `${config.server}/attributes/${selectedAttribute.webId}`;

        let batch = {
            // First, we need to retrieve the attribute.
            GetAttribute: {
                Method: "GET",
                Resource: `${initialResource}?webIdType=DefaultIDOnly&selectedFields=Links.Element;Links.Template`
            },
            // Second/third, we need to retrieve the attribute's template.
            GetAttributeTemplate: {
                Method: "GET",
                Resource: "{0}?webIdType=DefaultIDOnly&selectedFields=Name;Links.ElementTemplate",
                Parameters: ["$.GetAttribute.Content.Links.Template"],
                ParentIds: ["GetAttribute"]
            },
            // Second/third, we need to retrieve the attribute's parent element.
            GetParentElement: {
                Method: "GET",
                Resource: "{0}?webIdType=DefaultIDOnly&selectedFields=Links.Database;LInks.Template",
                Parameters: ["$.GetAttribute.Content.Links.Element"],
                ParentIds: ["GetAttribute"]
            },
            // Fourth/fifth, we need to retrieve the parent element's template.
            GetElementTemplate: {
                Method: "GET",
                Resource: "{0}?selectedFields=Name",
                Parameters: ["$.GetParentElement.Content.Links.Template"],
                ParentIds: ["GetParentElement"]
            },
            // Fourth/fifth, we need to retrieve the parent element's database.
            GetDatabase: {
                Method: "GET",
                Resource: "{0}?selectedFields=WebId",
                Parameters: ["$.GetParentElement.Content.Links.Database"],
                ParentIds: ["GetParentElement"]
            },
            // Sixth, we need to execute the search and get our results.
            GetTemplateImplementors: {
                Method: "GET",
                Resource: `${config.server}/assetdatabases/{0}/elementattributes?searchFullHierarchy=true&elementTemplate={1}&attributeNameFilter={2}&selectedFields=Items.Path;Items.Name;Items.WebId`,
                Parameters: [
                    "$.GetDatabase.Content.WebId",
                    "$.GetElementTemplate.Content.Name",
                    "$.GetAttributeTemplate.Content.Name"
                ],
                ParentIds: [
                    "GetDatabase",
                    "GetElementTemplate",
                    "GetAttributeTemplate"
                ]
            }
        };

        // Return the batch request content. This is just the body of the HTTP request!
        // It hasn't been executed or anything!
        return batch;
    }
}