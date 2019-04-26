import * as esprima from "esprima";
import { ExpressionStatement, ArrowFunctionExpression, MemberExpression, Identifier, ReturnStatement, BinaryExpression, Literal, Program } from "estree";


export function parseAsRange(expression: Function): { min: number, max: number } {

    const expr = ((
        esprima.parseModule(expression.toString().replace(/function \(?(\w)\)?/, "$1 =>"))
            .body[0] as ExpressionStatement)
        .expression as ArrowFunctionExpression)
        .body;

    let rangeExpression;
    if (expr.type === "BlockStatement") rangeExpression = (expr.body[0] as ReturnStatement).argument;
    else if (expr.type === "BinaryExpression") rangeExpression = expr;
    else throw new Error("Invalid expression.");
    if (rangeExpression.left.type !== "Identifier" || rangeExpression.left.name !== "x") throw new Error("Invalid expression.");

    const val = (rangeExpression.right as Literal).value as number;

    const range = {} as any;

    if (["==", "===", ">="].includes(rangeExpression.operator)) { range.min = val; }
    if (["==", "===", "<="].includes(rangeExpression.operator)) { range.max = val; }
    if (rangeExpression.operator === "<") { range.max = val - 1; }
    if (rangeExpression.operator === ">") { range.min = val + 1; }

    return range;
}