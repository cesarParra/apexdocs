import ExpressionSiteElement from "c/expressionSiteElement";
import {api} from "lwc";
import {z} from 'c/zod';

export default class Accordion extends ExpressionSiteElement {
    @api contextUrlParam;
    @api previewContextId;
    @api expr;
    @api respectSharing;
    @api autoCollapse;
    @api flushStyle;

    validate() {
        if (!this.computed) {
            return;
        }

        const accordionSchema = z.array(
            z.object({
                title: z.string(),
                content: z.string(),
            })
        );
        const validationResult = accordionSchema.safeParse(this.computed);
        if (!validationResult.success) {
            this.error = {
                message: 'Accordion component requires an array of objects with "title" and "content" properties.',
                rawError: JSON.stringify(validationResult.error.format(), null, 2),
            };
            return;
        }
    }
}