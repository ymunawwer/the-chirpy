import {Module} from './module.model'

// db.menus.aggregate([
//     {
//       $match: { parentId: "" }  // Match root level menus
//     },
//     {
//       $graphLookup: {
//         from: "menus",
//         startWith: "$id",
//         connectFromField: "id",
//         connectToField: "parentId",
//         as: "children",
//         depthField: "depth"
//       }
//     },
//     {
//       $addFields: {
//         children: {
//           $filter: {
//             input: "$children",
//             as: "child",
//             cond: { $eq: ["$$child.depth", 1] }  // Filter direct children only
//           }
//         }
//       }
//     },
//     {
//       $project: {
//         id: 1,
//         parentId: 1,
//         label: 1,
//         name: 1,
//         icon: 1,
//         type: 1,
//         route: 1,
//         order: 1,
//         component: 1,
//         hide: 1,
//         children: {
//           $map: {
//             input: "$children",
//             as: "child",
//             in: {
//               id: "$$child.id",
//               parentId: "$$child.parentId",
//               label: "$$child.label",
//               name: "$$child.name",
//               icon: "$$child.icon",
//               type: "$$child.type",
//               route: "$$child.route",
//               component: "$$child.component",
//               hide: "$$child.hide"
//             }
//           }
//         }
//       }
//     }
//   ]).toArray();

  

  export const getNestedMenuItems = async () => {
    try {
    //   const menuItems = await MenuItem.aggregate([
    //     {
    //       $match: { parentId: "" }
    //     },
    //     {
    //       $lookup: {
    //         from: "menuitems", // The name of the collection
    //         localField: "id",
    //         foreignField: "parentId",
    //         as: "children"
    //       }
    //     },
    //     {
    //       $unwind: {
    //         path: "$children",
    //         preserveNullAndEmptyArrays: true
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: "menuitems",
    //         localField: "children.id",
    //         foreignField: "parentId",
    //         as: "children.children"
    //       }
    //     },
    //     {
    //       $unwind: {
    //         path: "$children.children",
    //         preserveNullAndEmptyArrays: true
    //       }
    //     },
    //     {
    //       $group: {
    //         _id: "$_id",
    //         id: { $first: "$id" },
    //         parentId: { $first: "$parentId" },
    //         label: { $first: "$label" },
    //         name: { $first: "$name" },
    //         icon: { $first: "$icon" },
    //         type: { $first: "$type" },
    //         route: { $first: "$route" },
    //         order: { $first: "$order" },
    //         children: { $push: "$children" }
    //       }
    //     },
    //     {
    //       $addFields: {
    //         children: {
    //           $filter: {
    //             input: "$children",
    //             as: "child",
    //             cond: { $ne: ["$$child.id", null] }
    //           }
    //         }
    //       }
    //     }
    //   ]);
    const menu = Module.aggregate([
        {
          $match: { parentId: "" }  // Match root level menus
        },
        {
          $graphLookup: {
            from: "modulesmasters",
            startWith: "$id",
            connectFromField: "id",
            connectToField: "parentId",
            as: "children",
            depthField: "depth"
          }
        },
        {
          $addFields: {
            children: {
              $filter: {
                input: "$children",
                as: "child",
                cond: { $gte: ["$$child.depth", 0] }  // Filter direct children only
              }
            }
          }
        },
        {
          $project: {
         child:'$children',
            id: 1,
            parentId: 1,
            label: 1,
            name: 1,
            icon: 1,
            type: 1,
            route: 1,
            order: 1,
            component: 1,
            hide: 1,
            children: {
              $map: {
                input: "$children",
                as: "child",
                in: {
                  id: "$$child.id",
                  parentId: "$$child.parentId",
                  label: "$$child.label",
                  name: "$$child.name",
                  icon: "$$child.icon",
                  type: "$$child.type",
                  route: "$$child.route",
                  component: "$$child.component",
                  hide: "$$child.hide"
                }
              }
            }
          }
        }
      ]);
  
      return menu;
    } catch (error) {
      console.error("Error fetching menu items:", error);
      throw error;
    }
  };
  
//   module.exports = {
//     getNestedMenuItems
//   };
  